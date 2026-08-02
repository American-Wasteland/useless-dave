import { useEffect, useRef } from 'react'
import daveEmblem from '/dave-emblem.svg'
import type { ChatMessage as ChatMessageType } from '../../../types'
import { ChatMessage } from './ChatMessage'

interface MessageListProps {
  messages: ChatMessageType[]
  onQuickAction?: (text: string) => void
}

const quickActions = [
  { label: '💸 Nuevo gasto', prompt: 'Quiero registrar un gasto' },
  { label: '📋 Ver gastos', prompt: 'Muéstrame los gastos recientes' },
  { label: '🏷️ Categorías contables', prompt: 'Ver categorías contables' },
  { label: '🏢 Proveedores', prompt: 'Ver proveedores' },
  { label: '📁 Proyectos', prompt: 'Ver centros de costo' },
]

export function MessageList({ messages, onQuickAction }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesCount = messages.length

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesCount])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="relative mb-8">
          <img
            src={daveEmblem}
            alt="Dave"
            className="w-28 h-28 drop-shadow-xl"
          />
          <div className="absolute -bottom-2 -right-2 bg-card border-2 border-border rounded-full px-3 py-1 shadow-lg">
            <span className="text-lg">👋</span>
          </div>
        </div>

        <h2 className="text-4xl font-black text-foreground mb-3 text-center">
          ¿Qué hacemos hoy?
        </h2>
        <p className="text-muted-foreground mb-10 text-center text-lg">
          Cuéntame qué necesitas o elige una opción
        </p>

        <div className="flex flex-wrap justify-center gap-3 max-w-xl">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onQuickAction?.(action.prompt)}
              className="px-5 py-3 rounded-2xl bg-card border-2 border-border hover:border-secondary hover:shadow-lg text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 shadow-md"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="max-w-3xl mx-auto py-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
