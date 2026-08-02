import { ArrowUp } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '../../../lib/utils'
import type { CommandDefinition, CommandParameter } from '../commandRegistry'
import { searchCommands } from '../commandRegistry'

interface CommandInputState {
  stage: 'select-command' | 'collect-params'
  selectedCommand?: CommandDefinition
  currentParamIndex: number
  collectedParams: Record<string, string>
}

export function CommandInput() {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [state, setState] = useState<CommandInputState>({
    stage: 'select-command',
    currentParamIndex: 0,
    collectedParams: {},
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = searchCommands(input)

  // Ensure "/" prefix on focus
  const handleFocus = () => {
    if (!input.startsWith('/')) {
      setInput('/')
    }
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 200)
  }

  // Reset to command selection
  const resetToCommandSelection = () => {
    setState({
      stage: 'select-command',
      currentParamIndex: 0,
      collectedParams: {},
    })
    setInput('/')
    setShowSuggestions(true)
    inputRef.current?.focus()
  }

  // Select a command and start collecting params
  const selectCommand = (command: CommandDefinition) => {
    // If no parameters, navigate immediately
    if (command.parameters.length === 0) {
      const targetPath = `/${companyId}${command.targetPath}`
      navigate(targetPath)
      resetToCommandSelection()
      return
    }

    setState({
      stage: 'collect-params',
      selectedCommand: command,
      currentParamIndex: 0,
      collectedParams: {},
    })
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Get current parameter being collected
  const currentParam: CommandParameter | undefined =
    state.stage === 'collect-params' && state.selectedCommand
      ? state.selectedCommand.parameters[state.currentParamIndex]
      : undefined

  // Submit current parameter value
  const submitParamValue = () => {
    if (!currentParam || !state.selectedCommand) return

    const value = input.trim()

    // Validate required fields
    if (currentParam.required && !value) {
      return
    }

    // Save parameter
    const newParams = { ...state.collectedParams, [currentParam.name]: value }

    // Check if we have more params to collect
    const nextIndex = state.currentParamIndex + 1
    const hasMoreParams = nextIndex < state.selectedCommand.parameters.length

    if (hasMoreParams) {
      // Move to next parameter
      setState({
        ...state,
        currentParamIndex: nextIndex,
        collectedParams: newParams,
      })
      setInput('')
    } else {
      // All params collected - navigate to target page
      const queryParams = new URLSearchParams(newParams).toString()
      const targetPath = `/${companyId}${state.selectedCommand.targetPath}${queryParams ? `?${queryParams}` : ''}`
      navigate(targetPath)

      // Reset state
      resetToCommandSelection()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (state.stage === 'select-command') {
      // Select command from suggestions
      if (suggestions[selectedIndex]) {
        selectCommand(suggestions[selectedIndex])
      }
    } else if (state.stage === 'collect-params') {
      // Submit current parameter
      submitParamValue()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (state.stage === 'select-command' && showSuggestions) {
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
          setInput('/')
          break
      }
    } else if (state.stage === 'collect-params') {
      if (e.key === 'Escape') {
        resetToCommandSelection()
      }
    }
  }

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const placeholder =
    state.stage === 'collect-params' && currentParam
      ? currentParam.placeholder || currentParam.label
      : 'Escribe / para ver comandos...'

  const canSubmit =
    state.stage === 'select-command'
      ? suggestions.length > 0
      : state.stage === 'collect-params' &&
        currentParam &&
        (!currentParam.required || input.trim().length > 0)

  // Get list of answered parameters for display
  const answeredParams =
    state.stage === 'collect-params' && state.selectedCommand
      ? state.selectedCommand.parameters
          .slice(0, state.currentParamIndex)
          .map((param) => ({
            label: param.label,
            value: state.collectedParams[param.name] || '',
          }))
      : []

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Suggestions dropdown - shown above input */}
      {showSuggestions &&
        state.stage === 'select-command' &&
        suggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-3xl border-2 border-border shadow-xl overflow-hidden">
            {suggestions.map((cmd, index) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => selectCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full px-5 py-3 text-left transition-colors flex items-start gap-3',
                  index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50',
                )}
              >
                <span className="text-xl">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-semibold text-foreground">
                    {cmd.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {cmd.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

      {/* Input form - grows with content */}
      <form
        ref={containerRef}
        onSubmit={handleSubmit}
        className="relative rounded-3xl bg-card border-2 border-border shadow-lg p-2 transition-all focus-within:border-secondary focus-within:shadow-xl"
      >
        {/* Command header - shown when collecting params */}
        {state.stage === 'collect-params' && state.selectedCommand && (
          <div className="px-3 pt-2 pb-1 flex items-center gap-2">
            <span className="text-xl">{state.selectedCommand.icon}</span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {state.selectedCommand.name}
            </span>
            <button
              type="button"
              onClick={resetToCommandSelection}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar (Esc)
            </button>
          </div>
        )}

        {/* Previous answers - shown as chips */}
        {answeredParams.length > 0 && (
          <div className="px-3 pb-2 space-y-2">
            {answeredParams.map((param, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground min-w-0 shrink-0">
                  {param.label}:
                </span>
                <span className="font-medium text-foreground break-words">
                  {param.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Current input row */}
        <div className="flex items-center gap-2">
          {/* Current parameter label */}
          {state.stage === 'collect-params' && currentParam && (
            <div className="flex h-10 items-center px-2 text-sm text-muted-foreground shrink-0">
              {currentParam.label}:
            </div>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            type={currentParam?.type === 'number' ? 'number' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all',
              canSubmit
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
