import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { commands, searchCommands } from '../registry'
import type { Command } from '../types'

export function CommandPalette() {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Command[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update suggestions when input changes
  useEffect(() => {
    if (input.startsWith('/')) {
      const query = input.slice(1) // Remove leading "/"
      const results = query ? searchCommands(query) : commands
      setSuggestions(results.slice(0, 8))
      setShowSuggestions(true)
      setSelectedIndex(0)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }, [input])

  const executeCommand = (command: Command) => {
    setInput('')
    setShowSuggestions(false)
    navigate(`/${companyId}/comando/${command.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

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
      case 'Enter':
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          executeCommand(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setInput('')
        break
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Input */}
      <div className="bg-white rounded-2xl border-2 border-primary shadow-lg p-1">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe / para ver comandos..."
          className="w-full px-4 py-3 text-base bg-transparent outline-none font-mono"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-primary shadow-xl overflow-hidden z-10">
          {suggestions.map((cmd, index) => (
            <button
              key={cmd.id}
              type="button"
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-4 py-3 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-secondary/10'
                  : 'hover:bg-secondary/5'
              }`}
            >
              <div className="font-mono text-sm font-semibold text-primary">
                {cmd.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {cmd.description}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      {!showSuggestions && (
        <div className="mt-2 px-2 text-xs text-muted-foreground font-mono">
          Tip: Escribe <span className="text-primary font-semibold">/</span>{' '}
          para ver todos los comandos disponibles
        </div>
      )}
    </div>
  )
}
