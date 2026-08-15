import { Check } from 'lucide-react'
import { useReducer, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import type { PaymentStatus } from '../shared/types'
import { StepAmounts } from './steps/StepAmounts'
import { StepBasicInfo } from './steps/StepBasicInfo'
import { StepInvoice } from './steps/StepInvoice'
import { StepPaymentStatus } from './steps/StepPaymentStatus'
import { type PaymentData, StepPayments } from './steps/StepPayments'

export interface WizardData {
  title: string
  expenseDate: string
  providerId: string
  categoryId: string
  costCenterId: string
  subtotal: number
  iva: number
  reteFuente: number
  reteIca: number
  payments: PaymentData[]
  invoiceFile: File | null
  paymentStatus: PaymentStatus
}

type WizardAction = { type: 'update'; payload: Partial<WizardData> }

function wizardReducer(state: WizardData, action: WizardAction): WizardData {
  return { ...state, ...action.payload }
}

interface ExpenseWizardProps {
  mode: 'create' | 'edit'
  initialData?: Partial<WizardData>
  onSubmit: (data: WizardData) => Promise<void>
  isSubmitting: boolean
}

const STEPS = ['Info básica', 'Montos', 'Factura', 'Pagos', 'Estado']

function validate(step: number, data: WizardData): string | null {
  if (step === 0) {
    if (!data.title.trim()) return 'El título es requerido'
    if (!data.expenseDate) return 'La fecha del gasto es requerida'
    if (!data.providerId.trim()) return 'El proveedor es requerido'
    if (!data.categoryId.trim()) return 'La categoría es requerida'
    if (!data.costCenterId.trim()) return 'El centro de costo es requerido'
  }
  if (step === 1) {
    if (data.subtotal <= 0) return 'El subtotal debe ser mayor a 0'
    if (data.iva < 0) return 'El IVA no puede ser negativo'
    if (data.reteFuente < 0) return 'La reteFuente no puede ser negativa'
    if (data.reteIca < 0) return 'La reteIca no puede ser negativa'
  }
  // Invoice (step 2), payments (step 3), and status (step 4) are optional - no validation needed
  return null
}

export function ExpenseWizard({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: ExpenseWizardProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const step = Math.min(
    Math.max(Number(searchParams.get('step') ?? 0), 0),
    STEPS.length - 1,
  )

  const [data, dispatch] = useReducer(wizardReducer, {
    title: '',
    expenseDate: new Date().toISOString().split('T')[0],
    providerId: '',
    categoryId: '',
    costCenterId: '',
    subtotal: 0,
    iva: 0,
    reteFuente: 0,
    reteIca: 0,
    payments: [],
    invoiceFile: null,
    paymentStatus: 'pending',
    ...initialData,
  })

  const [error, setError] = useState<string | null>(null)

  const update = (payload: Partial<WizardData>) =>
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
            {(() => {
              const isClickable = i < step || (mode === 'edit' && i > step)
              return (
                <button
                  type="button"
                  onClick={() => isClickable && goTo(i)}
                  className={cn(
                    'flex flex-col items-center gap-1 shrink-0 group',
                    isClickable ? 'cursor-pointer' : 'cursor-default',
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      i < step
                        ? 'bg-primary text-primary-foreground group-hover:opacity-75'
                        : i === step
                          ? 'bg-secondary text-secondary-foreground ring-2 ring-secondary ring-offset-2'
                          : isClickable
                            ? 'bg-muted text-muted-foreground group-hover:bg-muted/60'
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
                </button>
              )
            })()}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  i < step ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Step content */}
      <div className="card p-6">
        {step === 0 && (
          <StepBasicInfo
            title={data.title}
            expenseDate={data.expenseDate}
            providerId={data.providerId}
            categoryId={data.categoryId}
            costCenterId={data.costCenterId}
            onUpdate={update}
          />
        )}
        {step === 1 && (
          <StepAmounts
            providerId={data.providerId}
            subtotal={data.subtotal}
            iva={data.iva}
            reteFuente={data.reteFuente}
            reteIca={data.reteIca}
            onUpdate={update}
          />
        )}
        {step === 2 && (
          <StepInvoice invoiceFile={data.invoiceFile} onUpdate={update} />
        )}
        {step === 3 && (
          <StepPayments payments={data.payments} onUpdate={update} />
        )}
        {step === 4 && (
          <StepPaymentStatus
            paymentStatus={data.paymentStatus}
            onUpdate={update}
          />
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Atrás
            </Button>
          )}
          {!isLast ? (
            <Button onClick={handleNext}>Continuar</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : mode === 'create'
                  ? 'Registrar gasto'
                  : 'Actualizar gasto'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
