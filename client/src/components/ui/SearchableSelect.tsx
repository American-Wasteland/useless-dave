import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
  subtitle?: string
}

export interface SearchableSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  isLoading?: boolean
  disabled?: boolean
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  isLoading = false,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonId = useRef(
    `searchable-select-${Math.random().toString(36).slice(2, 11)}`,
  ).current

  const selectedOption = options.find((opt) => opt.value === value)

  const filtered = search.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label
          htmlFor={buttonId}
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        id={buttonId}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-1 ring-primary border-primary',
        )}
      >
        <span className={cn('text-sm', !selectedOption && 'text-gray-500')}>
          {isLoading
            ? 'Cargando...'
            : selectedOption
              ? selectedOption.label
              : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No se encontraron resultados
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors',
                    option.value === value && 'bg-blue-50',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                    {option.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
