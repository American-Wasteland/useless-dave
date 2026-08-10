import type { CostCenterType } from '@useless-dave/shared'
import { Check } from 'lucide-react'
import { useReducer, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { StepDetails } from './steps/StepDetails'
import { StepType } from './steps/StepType'

export interface CostCenterWizardData {
  type: CostCenterType
  name: string
  description: string
}

type Action = { type: 'update'; payload: Partial<CostCenterWizardData> }

function reducer(
  state: CostCenterWizardData,
  action: Action,
): CostCenterWizardData {
  return { ...state, ...action.payload }
}

interface CostCenterWizardProps {
  mode: 'create' | 'edit'
  initialData?: Partial<CostCenterWizardData>
  onSubmit: (data: CostCenterWizardData) => Promise<void>
  isSubmitting: boolean
}

const STEPS = ['Tipo', 'Detalles']

function validate(step: number, data: CostCenterWizardData): string | null {
  if (step === 1) {
    if (!data.name.trim()) return 'El nombre es requerido'
  }
  return null
}

export function CostCenterWizard({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: CostCenterWizardProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const step = Math.min(
    Math.max(Number(searchParams.get('step') ?? 0), 0),
    STEPS.length - 1,
  )

  const [data, dispatch] = useReducer(reducer, {
    type: 'project',
    name: '',
    description: '',
    ...initialData,
  })

  const [error, setError] = useState<string | null>(null)

  const update = (payload: Partial<CostCenterWizardData>) =>
    dispatch({ type: 'update', payload })

  const goTo = (n: number) => {
    setSearchParams({ step: String(n) }, { replace: true })
    setError(null)
  }

  const handleNext = () => {
    const err = validate(step, data)
    if (err) {
      setError(err)
      return
    }
    goTo(step + 1)
  }

  const handleBack = () => goTo(step - 1)

  const handleSubmit = async () => {
    const err = validate(step, data)
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

  const isLast = step === STEPS.length - 1

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <nav className="flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                      ? 'bg-secondary text-secondary-foreground ring-2 ring-secondary ring-offset-2'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium whitespace-nowrap hidden sm:block',
                  i === step ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1 mx-2 mb-4',
                  i < step ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Step content */}
      <div className="card p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        {step === 0 && (
          <StepType value={data.type} onChange={(v) => update({ type: v })} />
        )}
        {step === 1 && (
          <StepDetails data={data} onChange={update} mode={mode} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={handleBack}>
            Atrás
          </Button>
        )}
        <div className="flex-1" />
        {isLast ? (
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
            {mode === 'create'
              ? 'Crear centro de costo'
              : 'Actualizar centro de costo'}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            Continuar
          </Button>
        )}
      </div>
    </div>
  )
}
