import { Bot } from 'lucide-react'
import { ChatInput, MessageList } from './components'
import { useChat } from './useChat'

export function ChatPage() {
  const { messages, isLoading, sendMessage, error } = useChat()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <Bot className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">Dave</h1>
          <p className="text-sm text-gray-500">Tu asistente de contabilidad</p>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  )
}
