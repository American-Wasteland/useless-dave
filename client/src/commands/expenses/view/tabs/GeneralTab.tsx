import { ExternalLink } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { Currency } from '../../../../components/ui'
import type { Expense } from '../../shared/types'

export function GeneralTab() {
  const { expense } = useOutletContext<{ expense: Expense }>()

  const DetailRow = ({
    label,
    value,
  }: {
    label: string
    value: React.ReactNode
  }) => (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Financial breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Desglose financiero
        </h3>
        <div className="card p-4">
          <DetailRow
            label="Subtotal"
            value={<Currency amount={expense.subtotal} />}
          />
          <DetailRow label="IVA" value={<Currency amount={expense.iva} />} />
          {expense.reteFuente && expense.reteFuente > 0 && (
            <DetailRow
              label="ReteFuente"
              value={
                <span className="text-red-600">
                  -<Currency amount={expense.reteFuente} />
                </span>
              }
            />
          )}
          {expense.reteIca && expense.reteIca > 0 && (
            <DetailRow
              label="ReteIca"
              value={
                <span className="text-red-600">
                  -<Currency amount={expense.reteIca} />
                </span>
              }
            />
          )}
        </div>
      </div>

      {/* Expense details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Información del gasto
        </h3>
        <div className="card p-4">
          <DetailRow label="Título" value={expense.title} />
          <DetailRow
            label="Fecha"
            value={new Date(expense.expenseDate).toLocaleDateString('es-CO')}
          />
          <DetailRow
            label="Proveedor"
            value={
              <span className="text-xs text-gray-500">
                ID: {expense.providerId}
              </span>
            }
          />
          <DetailRow
            label="Categoría"
            value={
              <span className="text-xs text-gray-500">
                ID: {expense.categoryId}
              </span>
            }
          />
          <DetailRow
            label="Centro de costo"
            value={
              <span className="text-xs text-gray-500">
                ID: {expense.costCenterId}
              </span>
            }
          />
        </div>
      </div>

      {/* Invoice */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Factura</h3>
        <div className="card p-4">
          {expense.invoiceUrl ? (
            <a
              href={expense.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver factura (PDF)
            </a>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Factura no cargada aún
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
