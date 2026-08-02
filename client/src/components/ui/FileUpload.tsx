import { Upload, X } from 'lucide-react'
import { type ChangeEvent, useId, useRef } from 'react'
import { cn } from '../../lib/utils'

interface FileUploadProps {
  label?: string
  accept?: string
  value?: File | null
  onChange: (file: File | null) => void
  error?: string
  className?: string
}

export function FileUpload({
  label,
  accept = 'image/*,.pdf',
  value,
  onChange,
  error,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(file)
  }

  const handleClear = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs text-gray-500 font-medium normal-case"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
          error ? 'border-red-300' : 'border-gray-300 hover:border-gray-400',
          value && 'bg-gray-50',
        )}
      >
        {value ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {value.name}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm">Subir archivo</span>
          </button>
        )}
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
