import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ChatAttachment, ChatMessage, ChatToolCall } from '../../types'
import {
  isDoneEvent,
  isErrorEvent,
  isTextEvent,
  isToolCallEvent,
  isToolResultEvent,
  sendChatMessage,
  uploadAttachments,
} from './chatService'

export function useChat() {
  const { companyId } = useParams<{ companyId: string }>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string, attachments: ChatAttachment[]) => {
      if (!companyId) {
        setError('No company selected')
        return
      }

      setIsLoading(true)
      setError(null)

      // Generate unique ID for messages
      const userMessageId = `user-${Date.now()}`
      const assistantMessageId = `assistant-${Date.now()}`

      try {
        // Upload attachments first
        const uploadedAttachments =
          attachments.length > 0
            ? await uploadAttachments(companyId, attachments)
            : []

        // Add user message immediately
        const userMessage: ChatMessage = {
          id: userMessageId,
          role: 'user',
          content,
          attachments:
            uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])

        // Add empty assistant message for streaming
        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          isStreaming: true,
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Track tool calls during streaming
        const streamingToolCalls: ChatToolCall[] = []

        // Send message and process stream
        const newSessionId = await sendChatMessage(
          content,
          uploadedAttachments,
          sessionId,
          (event) => {
            const { data } = event
            switch (event.type) {
              case 'text':
                if (isTextEvent(data)) {
                  const text = data.text
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + text }
                        : msg,
                    ),
                  )
                }
                break

              case 'tool_call':
                if (isToolCallEvent(data)) {
                  // Add placeholder tool call
                  streamingToolCalls.push({
                    name: data.name,
                    input: data.input,
                    result: '',
                  })
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, toolCalls: [...streamingToolCalls] }
                        : msg,
                    ),
                  )
                }
                break

              case 'tool_result':
                if (isToolResultEvent(data)) {
                  // Update the matching tool call with result
                  const { name, result } = data
                  const toolIndex = streamingToolCalls.findIndex(
                    (tc) => tc.name === name && tc.result === '',
                  )
                  if (toolIndex !== -1) {
                    streamingToolCalls[toolIndex] = {
                      ...streamingToolCalls[toolIndex],
                      result,
                    }
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, toolCalls: [...streamingToolCalls] }
                          : msg,
                      ),
                    )
                  }
                }
                break

              case 'done':
                if (isDoneEvent(data)) {
                  const finalToolCalls = data.toolCalls
                  // Finalize message
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            isStreaming: false,
                            toolCalls:
                              finalToolCalls || streamingToolCalls.length > 0
                                ? streamingToolCalls
                                : undefined,
                          }
                        : msg,
                    ),
                  )
                }
                break

              case 'error':
                if (isErrorEvent(data)) {
                  const errorMessage = data.message
                  setError(errorMessage)
                  // Remove the streaming message on error
                  setMessages((prev) =>
                    prev.filter((msg) => msg.id !== assistantMessageId),
                  )
                }
                break
            }
          },
        )

        // Update session ID if new
        if (newSessionId && newSessionId !== sessionId) {
          setSessionId(newSessionId)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al enviar mensaje')
        // Remove the streaming message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId),
        )
      } finally {
        setIsLoading(false)
      }
    },
    [companyId, sessionId],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
  }
}
