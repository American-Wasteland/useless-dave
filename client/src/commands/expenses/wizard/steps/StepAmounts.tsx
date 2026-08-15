import { Currency, TaxInput } from '../../../../components/ui'
import { useListProviders } from '../../../providers/list/useListProviders'

interface StepAmountsProps {
  providerId: string
  subtotal: number
  iva: number
  reteFuente: number
  reteIca: number
  onUpdate: (data: {
    subtotal?: number
    iva?: number
    reteFuente?: number
    reteIca?: number
  }) => void
}

export function StepAmounts({
  providerId,
  subtotal,
  iva,
  reteFuente,
  reteIca,
  onUpdate,
}: StepAmountsProps) {
  const { providers } = useListProviders()
  const provider = providers.find((p) => p.id === providerId)

  const total = subtotal + iva
  const amountToPay = total - reteFuente - reteIca

  // Auto-calculated values
  const vatRate = provider?.vatRate ?? 19
  const autoIva = Math.round(subtotal * (vatRate / 100) * 100) / 100

  const autoReteFuente = provider?.reteFuenteRate
    ? Math.round(subtotal * (provider.reteFuenteRate / 100) * 100) / 100
    : 0

  const autoReteIca = provider?.reteIcaRate
    ? Math.round(subtotal * (provider.reteIcaRate / 1000) * 100) / 100
    : 0

  const isSelfWithholding = !provider?.reteFuenteRate && !provider?.reteIcaRate

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="expense-subtotal"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          Subtotal
        </label>
        <input
          id="expense-subtotal"
          type="number"
          value={subtotal || ''}
          onChange={(e) => onUpdate({ subtotal: Number(e.target.value) })}
          placeholder="0"
          step="0.01"
          min="0.01"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          required
        />
      </div>

      <TaxInput
        label={`IVA (${vatRate}%)`}
        value={iva}
        onChange={(value) => onUpdate({ iva: value })}
        autoValue={autoIva}
        autoLabel={`Auto: ${vatRate}%`}
      />

      <div className="border-t pt-3">
        <div className="flex justify-between text-sm font-medium mb-3">
          <span>Total (subtotal + IVA):</span>
          <Currency amount={total} />
        </div>
      </div>

      {isSelfWithholding && provider && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          🔖 <strong>{provider.name}</strong> es autorretenedor - no aplican
          retenciones por defecto
        </div>
      )}

      <TaxInput
        label="ReteFuente (opcional)"
        value={reteFuente}
        onChange={(value) => onUpdate({ reteFuente: value })}
        autoValue={autoReteFuente}
        autoLabel={
          provider?.reteFuenteRate
            ? `Auto: ${provider.reteFuenteRate}%`
            : undefined
        }
      />

      <TaxInput
        label="ReteIca (opcional)"
        value={reteIca}
        onChange={(value) => onUpdate({ reteIca: value })}
        autoValue={autoReteIca}
        autoLabel={
          provider?.reteIcaRate
            ? `Auto: ${provider.reteIcaRate}/1000`
            : undefined
        }
      />

      {(reteFuente > 0 || reteIca > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <Currency amount={total} />
          </div>
          {reteFuente > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">- ReteFuente:</span>
              <Currency amount={reteFuente} />
            </div>
          )}
          {reteIca > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">- ReteIca:</span>
              <Currency amount={reteIca} />
            </div>
          )}
          <div className="flex justify-between font-semibold text-primary border-t border-blue-200 pt-1 mt-2">
            <span>Monto a pagar:</span>
            <Currency amount={amountToPay} />
          </div>
        </div>
      )}
    </div>
  )
}
