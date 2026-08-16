import type { PaymentStatus } from '../../shared/types'

interface StepPaymentStatusProps {
  paymentStatus: PaymentStatus
  onUpdate: (data: { paymentStatus: PaymentStatus }) => void
}

export function StepPaymentStatus({
  paymentStatus,
  onUpdate,
}: StepPaymentStatusProps) {
  const options: Array<{
    value: PaymentStatus
    label: string
    description: string
  }> = [
    {
      value: 'pending',
      label: 'Pendiente',
      description: 'El gasto aún no ha sido pagado',
    },
    {
      value: 'partial',
      label: 'Pago parcial',
      description: 'Se ha pagado parte del monto',
    },
    {
      value: 'paid',
      label: 'Pagado',
      description: 'El gasto ha sido pagado completamente',
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-500 font-medium normal-case block mb-3">
          Estado del pago
        </div>

        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentStatus === option.value
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentStatus"
                value={option.value}
                checked={paymentStatus === option.value}
                onChange={() => onUpdate({ paymentStatus: option.value })}
                className="mt-0.5 h-4 w-4 accent-secondary focus:ring-secondary"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
