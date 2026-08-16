import { Check, Loader2, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

export interface SearchPickerOption {
  value: string
  label: string
  subtitle?: string
}

interface SearchPickerModalProps {
  label?: string
  value: string
  selectedLabel?: string
  onSearch: (query: string) => Promise<SearchPickerOption[]>
  onFetchAll?: () => Promise<SearchPickerOption[]>
  onSelect: (option: SearchPickerOption) => void
  placeholder?: string
  searchPlaceholder?: string
  modalTitle: string
  disabled?: boolean
}

export function SearchPickerModal({
  label,
  value,
  selectedLabel,
  onSearch,
  onFetchAll,
  onSelect,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  modalTitle,
  disabled = false,
}: SearchPickerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchPickerOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setHasSearched(false)
    setIsSearching(false)
    setFocusedIndex(-1)
  }

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    const trimmed = query.trim()
    const isFetchAll = trimmed === '***' && !!onFetchAll

    if (!isFetchAll && trimmed.length < 3) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      setFocusedIndex(-1)
      return
    }

    setIsSearching(true)
    setHasSearched(false)

    const timer = setTimeout(async () => {
      try {
        const data = isFetchAll ? await onFetchAll!() : await onSearch(trimmed)
        setResults(data)
        setHasSearched(true)
        setFocusedIndex(-1)
      } catch {
        setResults([])
        setHasSearched(true)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch, onFetchAll])

  const handleSelect = (option: SearchPickerOption) => {
    onSelect(option)
    handleClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
      return
    }

    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => {
        const next = i < results.length - 1 ? i + 1 : 0
        itemRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => {
        const next = i > 0 ? i - 1 : results.length - 1
        itemRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[focusedIndex])
    }
  }

  const displayLabel = value && selectedLabel ? selectedLabel : undefined
  const triggerId = useRef(
    `search-picker-${Math.random().toString(36).slice(2, 9)}`,
  ).current

  return (
    <div>
      {label && (
        <label
          htmlFor={triggerId}
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          {label}
        </label>
      )}

      <button
        id={triggerId}
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={cn('text-sm truncate', !displayLabel && 'text-gray-500')}
        >
          {displayLabel ?? placeholder}
        </span>
        <Search className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <button
              type="button"
              className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-default"
              onClick={handleClose}
              aria-label="Cerrar"
            />

            <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                <h2 className="text-base font-semibold text-gray-900">
                  {modalTitle}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search input */}
              <div className="px-6 py-4 border-b border-gray-100 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="overflow-y-auto flex-1" ref={listRef}>
                {isSearching ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : query.trim().length < 3 ? (
                  <p className="px-6 py-16 text-sm text-gray-400 text-center">
                    Escribe al menos 3 caracteres para buscar
                  </p>
                ) : hasSearched && results.length === 0 ? (
                  <p className="px-6 py-16 text-sm text-gray-400 text-center">
                    No se encontraron resultados
                  </p>
                ) : (
                  results.map((option, i) => (
                    <button
                      key={option.value}
                      ref={(el) => {
                        itemRefs.current[i] = el
                      }}
                      type="button"
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setFocusedIndex(i)}
                      className={cn(
                        'w-full flex items-center gap-4 px-6 py-4 text-left transition-colors border-b border-gray-100 last:border-0',
                        i === focusedIndex
                          ? 'bg-primary/10'
                          : option.value === value
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.subtitle && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {option.subtitle}
                          </div>
                        )}
                      </div>
                      {option.value === value && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
