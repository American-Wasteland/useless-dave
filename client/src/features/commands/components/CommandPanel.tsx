import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SlidePanel } from '../../../components/ui'
import { executeCommand } from '../commandService'
import { findCommand } from '../registry'

export function CommandPanel() {
  const { companyId, commandId } = useParams<{
    companyId: string
    commandId: string
  }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const command = commandId ? findCommand(commandId) : undefined

  if (!command) {
    return (
      <SlidePanel onClose={() => navigate(`/${companyId}`)}>
        <div className="p-6 text-center text-destructive">
          Comando no encontrado: {commandId}
        </div>
      </SlidePanel>
    )
  }

  const handleInputChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return

    // Validate required fields
    const missingFields = command.parameters
      .filter((param) => param.required && !formData[param.name])
      .map((param) => param.name)

    if (missingFields.length > 0) {
      setError(`Campos requeridos: ${missingFields.join(', ')}`)
      return
    }

    setIsExecuting(true)
    setError(null)
    setResult(null)

    const response = await executeCommand(command.id, companyId, formData)

    setIsExecuting(false)

    if (response.success) {
      setResult(response.result || 'Comando ejecutado exitosamente')
      // Clear form after successful create operations
      if (command.id.startsWith('crear-')) {
        setFormData({})
      }
    } else {
      setError(response.error || 'Error desconocido')
    }
  }

  return (
    <SlidePanel onClose={() => navigate(`/${companyId}`)}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b-2 border-primary/10 px-6 py-4">
          <h2 className="text-xl font-black text-primary font-mono">
            {command.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {command.description}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {command.parameters.map((param) => (
              <div key={param.name}>
                <label
                  htmlFor={param.name}
                  className="block text-sm font-semibold text-foreground mb-1"
                >
                  {param.description}
                  {param.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>

                {param.type === 'number' ? (
                  <input
                    id={param.name}
                    type="number"
                    value={(formData[param.name] as number) || ''}
                    onChange={(e) =>
                      handleInputChange(param.name, Number(e.target.value))
                    }
                    className="w-full px-4 py-2 border-2 border-primary/20 rounded-xl outline-none focus:border-primary transition-colors"
                    required={param.required}
                  />
                ) : param.type === 'date' ? (
                  <input
                    id={param.name}
                    type="date"
                    value={(formData[param.name] as string) || ''}
                    onChange={(e) =>
                      handleInputChange(param.name, e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-primary/20 rounded-xl outline-none focus:border-primary transition-colors"
                    required={param.required}
                  />
                ) : (
                  <input
                    id={param.name}
                    type="text"
                    value={(formData[param.name] as string) || ''}
                    onChange={(e) =>
                      handleInputChange(param.name, e.target.value)
                    }
                    className="w-full px-4 py-2 border-2 border-primary/20 rounded-xl outline-none focus:border-primary transition-colors"
                    required={param.required}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Result */}
          {result && (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="text-sm font-semibold text-green-900 mb-1">
                ✓ Éxito
              </div>
              <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                {result}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl">
              <div className="text-sm font-semibold text-destructive mb-1">
                ⚠ Error
              </div>
              <p className="text-xs text-destructive/90">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <div className="mt-6 pt-6 border-t-2 border-primary/10">
            <button
              type="submit"
              disabled={isExecuting}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? 'Ejecutando...' : 'Ejecutar comando'}
            </button>
          </div>
        </form>
      </div>
    </SlidePanel>
  )
}
