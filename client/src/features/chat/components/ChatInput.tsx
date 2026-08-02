import { Paperclip, Send, X } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useRef, useState } from 'react'
import { cn } from '../../../lib/utils'
import type { ChatAttachment } from '../../../types'

interface ChatInputProps {
  onSend: (message: string, attachments: ChatAttachment[]) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return
    if (isLoading) return

    onSend(message.trim(), attachments)
    setMessage('')
    setAttachments([])

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Auto-grow textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments: ChatAttachment[] = Array.from(files).map((file) => ({
      type: file.name.toLowerCase().includes('factura') ? 'invoice' : 'voucher',
      name: file.name,
      url: '', // Will be filled after upload
      file,
    }))

    setAttachments((prev) => [...prev, ...newAttachments])

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={`${attachment.name}-${index}`}
              className="flex items-center gap-2 rounded-full bg-gray-100 py-1 pl-3 pr-2 text-sm"
            >
              <span className="max-w-[150px] truncate text-gray-700">
                {attachment.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Adjuntar archivo"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message input */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            disabled={isLoading}
            className={cn(
              'w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm',
              'placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'disabled:bg-gray-50 disabled:text-gray-500',
            )}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700',
            'disabled:bg-gray-200 disabled:text-gray-400',
          )}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  )
}
