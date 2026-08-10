import { Outlet } from 'react-router-dom'
import { ChatInput, MessageList, ToolPreviewPanel } from './components'
import { useChat } from './useChat'

export function ChatWithPanels() {
  const {
    messages,
    isLoading,
    sendMessage,
    error,
    activeToolCall,
    closeToolPreview,
  } = useChat()

  return (
    <>
      {/* Chat - always visible */}
      <div className="h-full flex flex-col">
        {/* Error banner */}
        {error && (
          <div className="mx-auto max-w-2xl w-full px-4 pt-4">
            <div className="bg-destructive/10 text-destructive px-5 py-3 text-sm rounded-2xl border-2 border-destructive/20 font-medium">
              ⚠️ {error}
            </div>
          </div>
        )}

        {/* Messages */}
        <MessageList
          messages={messages}
          onQuickAction={(text) => {
            sendMessage(text, [])
          }}
        />

        {/* Input */}
        <div className="px-4 pb-8 pt-4">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* Tool Preview Panel */}
      <ToolPreviewPanel toolCall={activeToolCall} onClose={closeToolPreview} />

      {/* Route panels render here */}
      <Outlet />
    </>
  )
}
