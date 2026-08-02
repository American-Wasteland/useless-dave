import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '../../../types'
import { ChatMessage } from './ChatMessage'

interface MessageListProps {
  messages: ChatMessageType[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesCount = messages.length

  // Auto-scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to scroll when message count changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesCount])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-3xl">👋</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">¡Hola! Soy Dave</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Tu asistente de contabilidad. Puedo ayudarte a registrar gastos,
          compras y pagos. Solo escríbeme lo que necesitas.
        </p>
        <div className="mt-6 space-y-2 text-left text-sm text-gray-500">
          <p className="font-medium text-gray-700">Ejemplos:</p>
          <p>
            "Registra una compra de 150 mil en tela de Spirit para Mediport"
          </p>
          <p>"Muéstrame los gastos pendientes"</p>
          <p>"Registra el pago desde Bold del último gasto"</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-100">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
