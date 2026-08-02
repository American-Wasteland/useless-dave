import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import type { ChatAttachment, ChatToolCall } from '../../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface ChatStreamEvent {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  data: unknown
}

interface TextEventData {
  text: string
}

interface ToolCallEventData {
  name: string
  input: Record<string, unknown>
}

interface ToolResultEventData {
  name: string
  result: string
}

interface DoneEventData {
  sessionId: string
  toolCalls?: ChatToolCall[]
}

interface ErrorEventData {
  message: string
}

export type ChatEventHandler = (event: ChatStreamEvent) => void

export async function uploadAttachments(
  companyId: string,
  attachments: ChatAttachment[],
): Promise<ChatAttachment[]> {
  const uploadPromises = attachments.map(async (attachment) => {
    if (!attachment.file) return attachment
    if (attachment.url) return attachment // Already uploaded

    const folder = attachment.type === 'invoice' ? 'invoices' : 'vouchers'
    const fileName = `${Date.now()}_${attachment.file.name}`
    const fileRef = ref(storage, `companies/${companyId}/${folder}/${fileName}`)

    await uploadBytes(fileRef, attachment.file)
    const url = await getDownloadURL(fileRef)

    return {
      ...attachment,
      url,
      file: undefined, // Remove file after upload
    }
  })

  return Promise.all(uploadPromises)
}

export async function sendChatMessage(
  message: string,
  attachments: ChatAttachment[],
  sessionId: string | null,
  onEvent: ChatEventHandler,
): Promise<string | null> {
  const url = `${API_URL}/chat`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sessionId,
      attachments: attachments
        .filter((a) => a.url)
        .map((a) => ({
          type: a.type,
          url: a.url,
          name: a.name,
        })),
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  // Get session ID from headers
  const newSessionId = response.headers.get('X-Session-Id')

  // Process SSE stream
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Process complete SSE events
    const lines = buffer.split('\n')
    buffer = lines.pop() || '' // Keep incomplete line in buffer

    let currentEvent = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7)
      } else if (line.startsWith('data: ') && currentEvent) {
        const data = line.slice(6)
        try {
          const parsed = JSON.parse(data)
          onEvent({
            type: currentEvent as ChatStreamEvent['type'],
            data: parsed,
          })
        } catch (e) {
          console.error('Failed to parse SSE data:', e)
        }
        currentEvent = ''
      }
    }
  }

  return newSessionId
}

// Type guards for event data
export function isTextEvent(data: unknown): data is TextEventData {
  return typeof data === 'object' && data !== null && 'text' in data
}

export function isToolCallEvent(data: unknown): data is ToolCallEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'input' in data
  )
}

export function isToolResultEvent(data: unknown): data is ToolResultEventData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'result' in data
  )
}

export function isDoneEvent(data: unknown): data is DoneEventData {
  return typeof data === 'object' && data !== null && 'sessionId' in data
}

export function isErrorEvent(data: unknown): data is ErrorEventData {
  return typeof data === 'object' && data !== null && 'message' in data
}
