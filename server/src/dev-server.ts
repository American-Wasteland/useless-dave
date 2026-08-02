import 'dotenv/config'
import { type Content, GoogleGenerativeAI } from '@google/generative-ai'
import cors from 'cors'
import express from 'express'
import { db } from './lib/db.js'
import {
  executeTool,
  SYSTEM_PROMPT,
  type ToolContext,
  toolSchemas,
} from './tools/index.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

interface ChatRequest {
  message: string
  sessionId?: string
  attachments?: Array<{
    type: 'invoice' | 'voucher'
    url: string
    name: string
  }>
}

// Simple in-memory session storage for dev
const sessions = new Map<string, Content[]>()

app.post('/chat', async (req, res) => {
  try {
    const body = req.body as ChatRequest
    const { message, sessionId, attachments } = body

    if (!message?.trim()) {
      res.status(400).json({ error: 'Message is required' })
      return
    }

    // For dev, use a fixed company/user
    const companyId = 'default-company'
    const userId = 'dev-user'

    // Get or create session
    const currentSessionId = sessionId || `session-${Date.now()}`
    const sessionHistory = sessions.get(currentSessionId) || []

    // Build user message
    let userMessageContent = message
    if (attachments?.length) {
      const list = attachments
        .map((a) => `- ${a.type}: ${a.name} (URL: ${a.url})`)
        .join('\n')
      userMessageContent += `\n\n[Archivos adjuntos:\n${list}]`
    }

    // Initialize Gemini
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not set')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: toolSchemas }],
    })

    const toolCtx: ToolContext = { db, companyId, userId }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Session-Id', currentSessionId)

    const sendEvent = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    const toolCalls: Array<{
      name: string
      input: Record<string, unknown>
      result: string
    }> = []
    let fullResponse = ''

    // Start chat with history
    const chat = model.startChat({ history: sessionHistory })

    let result = await chat.sendMessage(userMessageContent)
    let response = result.response

    // Handle tool calls in a loop
    let functionCalls = response.functionCalls()
    while (functionCalls?.length) {
      const toolResults = []
      for (const call of functionCalls) {
        sendEvent('tool_call', { name: call.name, input: call.args })

        const toolResult = await executeTool(
          toolCtx,
          call.name,
          call.args as Record<string, unknown>,
        )
        toolCalls.push({
          name: call.name,
          input: call.args as Record<string, unknown>,
          result: toolResult,
        })

        sendEvent('tool_result', { name: call.name, result: toolResult })

        toolResults.push({
          functionResponse: {
            name: call.name,
            response: { result: toolResult },
          },
        })
      }

      // Send tool results back to the model
      result = await chat.sendMessage(toolResults)
      response = result.response
      functionCalls = response.functionCalls()
    }

    // Get final text response
    fullResponse = response.text()
    sendEvent('text', { text: fullResponse })

    // Update session history
    const newHistory = await chat.getHistory()
    sessions.set(currentSessionId, newHistory)

    sendEvent('done', {
      sessionId: currentSessionId,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    })
    res.end()
  } catch (error) {
    console.error('Chat error:', error)
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal error',
      })
    } else {
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : 'Unknown error' })}\n\n`,
      )
      res.end()
    }
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`)
  console.log(`   POST /chat to send messages`)
})
