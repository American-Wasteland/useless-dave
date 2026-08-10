import { useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../../components/ui'

export interface CategoryWizardData {
  name: string
}

type Action = { type: 'update'; payload: Partial<CategoryWizardData> }

function reducer(
  state: CategoryWizardData,
  action: Action,
): CategoryWizardData {
  return { ...state, ...action.payload }
}

interface CategoryWizardProps {
  mode: 'create' | 'edit'
  initialData?: Partial<CategoryWizardData>
  onSubmit: (data: CategoryWizardData) => Promise<void>
  isSubmitting: boolean
}

function validate(data: CategoryWizardData): string | null {
  if (!data.name.trim()) return 'El nombre es requerido'
  return null
}

export function CategoryWizard({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: CategoryWizardProps) {
  const navigate = useNavigate()
  const [data, dispatch] = useReducer(reducer, {
    name: '',
    ...initialData,
  })

  const [error, setError] = useState<string | null>(null)

  const update = (payload: Partial<CategoryWizardData>) =>
    dispatch({ type: 'update', payload })

  const handleSubmit = async () => {
    const err = validate(data)
    if (err) {
      setError(err)
      return
    }
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
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Detalles de la categoría
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Información para identificar esta categoría contable
            </p>
          </div>
          <Input
            id="name"
            label="Nombre *"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="ej: Insumos médicos"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <div className="flex-1" />
        <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
          {mode === 'create' ? 'Crear categoría' : 'Actualizar categoría'}
        </Button>
      </div>
    </div>
  )
}
