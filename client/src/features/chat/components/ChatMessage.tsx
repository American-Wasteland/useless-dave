import daveEmblem from '/dave-emblem.svg'
import { cn } from '../../../lib/utils'
import type { ChatMessage as ChatMessageType } from '../../../types'
import { ToolCallCard } from './ToolCallCard'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-4 py-6', isUser ? 'flex-row-reverse' : '')}>
      {/* Avatar */}
      {isUser ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-black text-sm">
          TÚ
        </div>
      ) : (
        <img
          src={daveEmblem}
          alt="Dave"
          className="h-10 w-10 shrink-0 drop-shadow-md"
        />
      )}

      <div
        className={cn(
          'flex-1 space-y-3 max-w-[85%]',
          isUser ? 'text-right' : '',
        )}
      >
        {/* Attachments for user messages */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {message.attachments.map((attachment, index) => (
              <a
                key={`${attachment.name}-${index}`}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-secondary/10 border-2 border-secondary/20 px-4 py-2 text-sm font-medium text-foreground hover:border-secondary/40 transition-colors"
              >
                📎
                <span className="max-w-[150px] truncate">
                  {attachment.name}
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'inline-block rounded-3xl px-5 py-3 text-sm',
            isUser
              ? 'bg-secondary text-secondary-foreground rounded-tr-lg'
              : 'bg-card border-2 border-border rounded-tl-lg shadow-sm',
          )}
        >
          <div className="whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current" />
            )}
          </div>
        </div>

        {/* Tool calls for assistant messages */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2">
            {message.toolCalls.map((toolCall, index) => (
              <ToolCallCard
                key={`${toolCall.name}-${index}`}
                toolCall={toolCall}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
