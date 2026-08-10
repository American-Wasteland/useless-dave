import { useReducer, useState } from 'react'
import { Button, Input } from '../../../components/ui'

export interface BankAccountWizardData {
  name: string
}

type Action = { type: 'update'; payload: Partial<BankAccountWizardData> }

function reducer(state: BankAccountWizardData, action: Action): BankAccountWizardData {
  return { ...state, ...action.payload }
}

interface BankAccountWizardProps {
  mode: 'create' | 'edit'
  initialData?: Partial<BankAccountWizardData>
  onSubmit: (data: BankAccountWizardData) => Promise<void>
  isSubmitting: boolean
}

function validate(data: BankAccountWizardData): string | null {
  if (!data.name.trim()) return 'El nombre es requerido'
  return null
}

export function BankAccountWizard({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: BankAccountWizardProps) {
  const [data, dispatch] = useReducer(reducer, {
    name: '',
    ...initialData,
  })

  const [error, setError] = useState<string | null>(null)

  const update = (payload: Partial<BankAccountWizardData>) =>
    dispatch({ type: 'update', payload })

  const handleSubmit = async () => {
    const err = validate(data)
    if (err) { setError(err); return }
    setError(null)
    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Información de la cuenta</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Nombre que identifica esta cuenta bancaria
            </p>
          </div>
          <Input
            id="name"
            label="Nombre de la cuenta *"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="ej: Bancolombia Ahorros"
            autoFocus
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
          {mode === 'create' ? 'Crear cuenta' : 'Actualizar cuenta'}
        </Button>
      </div>
    </div>
  )
}
