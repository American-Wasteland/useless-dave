import { Info } from 'lucide-react'

interface StepTaxesProps {
  vatRate: number
  reteFuenteRate: number
  reteIcaRate: number
  onUpdate: (data: {
    vatRate?: number
    reteFuenteRate?: number
    reteIcaRate?: number
  }) => void
}

export function StepTaxes({
  vatRate,
  reteFuenteRate,
  reteIcaRate,
  onUpdate,
}: StepTaxesProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Información sobre impuestos</p>
            <p className="text-xs text-gray-600">
              Esta información se usará para calcular automáticamente los
              impuestos y retenciones al registrar gastos con este proveedor.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="provider-vat-rate"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          IVA (%)
        </label>
        <input
          id="provider-vat-rate"
          type="number"
          value={vatRate === 0 ? '0' : vatRate || ''}
          onChange={(e) =>
            onUpdate({
              vatRate: e.target.value === '' ? 0 : Number(e.target.value),
            })
          }
          placeholder="19"
          step="0.01"
          min="0"
          max="100"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Porcentaje de IVA a aplicar (común: 19%)
        </p>
      </div>

      <div>
        <label
          htmlFor="provider-retefuente-rate"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          ReteFuente (%)
        </label>
        <input
          id="provider-retefuente-rate"
          type="number"
          value={reteFuenteRate === 0 ? '0' : reteFuenteRate || ''}
          onChange={(e) =>
            onUpdate({
              reteFuenteRate:
                e.target.value === '' ? 0 : Number(e.target.value),
            })
          }
          placeholder="0 (autorretenedor)"
          step="0.01"
          min="0"
          max="100"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Porcentaje a retener sobre la base (común: 4%)
        </p>
      </div>

      <div>
        <label
          htmlFor="provider-reteica-rate"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          ReteIca (‰)
        </label>
        <input
          id="provider-reteica-rate"
          type="number"
          value={reteIcaRate === 0 ? '0' : reteIcaRate || ''}
          onChange={(e) =>
            onUpdate({
              reteIcaRate: e.target.value === '' ? 0 : Number(e.target.value),
            })
          }
          placeholder="0 (autorretenedor)"
          step="0.01"
          min="0"
          max="1000"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Por mil a retener sobre la base (común: 9.66/1000)
        </p>
      </div>
    </div>
  )
}
