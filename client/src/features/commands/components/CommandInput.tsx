import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '../../../lib/utils'
import type { CommandDefinition } from '../commandRegistry'
import { searchCommands } from '../commandRegistry'

export function CommandInput() {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [queryCommand, setQueryCommand] = useState<CommandDefinition | null>(
    null,
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = searchCommands(queryCommand ? '' : input)

  const handleFocus = () => {
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const enterQueryMode = (command: CommandDefinition) => {
    setQueryCommand(command)
    setInput(`${command.name} `)
    setShowSuggestions(true)
    setSelectedIndex(0)
  }

  const executeCommand = (command: CommandDefinition) => {
    if (command.queryMode) {
      enterQueryMode(command)
      return
    }
    navigate(`/${companyId}${command.targetPath}`)
    setInput('')
    setShowSuggestions(false)
  }

  const submitQuery = () => {
    if (!queryCommand) return
    const query = input.slice(queryCommand.name.length).trim()
    const basePath = queryCommand.targetPath
    const separator = basePath.includes('?') ? '&' : '?'
    const destination = query
      ? `/${companyId}${basePath}${separator}q=${encodeURIComponent(query)}`
      : `/${companyId}${basePath}`
    navigate(destination)
    setInput('')
    setQueryCommand(null)
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (queryCommand) {
      submitQuery()
      return
    }
    if (suggestions[selectedIndex]) {
      executeCommand(suggestions[selectedIndex])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    if (queryCommand && !value.startsWith(queryCommand.name)) {
      setQueryCommand(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (queryCommand) {
      if (e.key === 'Escape') {
        setInput('')
        setQueryCommand(null)
        setShowSuggestions(false)
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        )
        break
      case 'Escape':
        setShowSuggestions(false)
        setInput('')
        break
    }
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const queryText = queryCommand
    ? input.slice(queryCommand.name.length).trim()
    : ''

  return (
    <div className="w-full relative">
      {/* Suggestions dropdown */}
      {showSuggestions &&
        (queryCommand ? (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-3xl border-2 border-border shadow-xl overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-3">
              <span className="text-xl">{queryCommand.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {queryCommand.queryMode!.placeholder}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {queryText
                    ? `Buscando "${queryText}" — presiona ↵ para continuar`
                    : 'Escribe tu búsqueda y presiona ↵'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-3xl border-2 border-border shadow-xl overflow-hidden max-h-[360px] overflow-y-auto">
              {(() => {
                const isSearching = input.trim().length > 0
                let lastGroup = ''
                return suggestions.map((cmd, index) => {
                  const showHeader = !isSearching && cmd.group !== lastGroup
                  lastGroup = cmd.group
                  return (
                    <div key={cmd.id}>
                      {showHeader && (
                        <div className="px-5 pt-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {cmd.group}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'w-full px-5 py-3 text-left transition-colors flex items-start gap-3',
                          index === selectedIndex
                            ? 'bg-muted'
                            : 'hover:bg-muted/50',
                        )}
                      >
                        <span className="text-xl">{cmd.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">
                            {cmd.description}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground mt-0.5">
                            {cmd.name}
                          </div>
                        </div>
                      </button>
                    </div>
                  )
                })
              })()}
            </div>
          )
        ))}

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-3xl bg-card border-2 border-border shadow-lg p-2 transition-all focus-within:border-secondary focus-within:shadow-xl"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={
              queryCommand
                ? queryCommand.queryMode!.placeholder
                : '¿Qué quieres hacer? (ej: crear un proveedor)'
            }
            className="flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          <button
            type="submit"
            disabled={!queryCommand && suggestions.length === 0}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all',
              queryCommand || suggestions.length > 0
                ? 'bg-secondary text-secondary-foreground hover:scale-105 shadow-md'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
