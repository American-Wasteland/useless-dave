import { ArrowUp, Paperclip, X } from 'lucide-react'
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
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments: ChatAttachment[] = Array.from(files).map((file) => ({
      type: file.name.toLowerCase().includes('factura') ? 'invoice' : 'voucher',
      name: file.name,
      url: '',
      file,
    }))

    setAttachments((prev) => [...prev, ...newAttachments])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const canSend = message.trim() || attachments.length > 0

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 justify-center">
          {attachments.map((attachment, index) => (
            <div
              key={`${attachment.name}-${index}`}
              className="flex items-center gap-2 rounded-2xl bg-card border-2 border-border py-2 pl-4 pr-2 text-sm font-medium shadow-sm"
            >
              <span>📎</span>
              <span className="max-w-[150px] truncate text-foreground">
                {attachment.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-3xl bg-card border-2 border-border shadow-lg p-2 transition-all focus-within:border-secondary focus-within:shadow-xl"
      >
        {/* File upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Escríbele a Dave..."
          rows={1}
          disabled={isLoading}
          className={cn(
            'flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-foreground',
            'placeholder:text-muted-foreground focus:outline-none',
            'disabled:text-muted-foreground',
          )}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || !canSend}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all',
            canSend && !isLoading
              ? 'bg-secondary text-secondary-foreground hover:scale-105 shadow-md'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  )
}
