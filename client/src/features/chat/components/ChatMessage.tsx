import { Bot, User } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { ChatMessage as ChatMessageType } from '../../../types'
import { ToolCallCard } from './ToolCallCard'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn('flex gap-3 px-4 py-3', isUser ? 'bg-white' : 'bg-gray-50')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary-100 text-primary-600'
            : 'bg-emerald-100 text-emerald-600',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-sm font-medium text-gray-900">
          {isUser ? 'Tú' : 'Dave'}
        </p>

        {/* Attachments for user messages */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment, index) => (
              <a
                key={`${attachment.name}-${index}`}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
              >
                <span className="capitalize">{attachment.type}:</span>
                <span className="max-w-[150px] truncate">
                  {attachment.name}
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Message content */}
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {message.content}
          {message.isStreaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-gray-400" />
          )}
        </div>

        {/* Tool calls for assistant messages */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2 pt-2">
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
