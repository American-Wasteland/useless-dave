import { ArrowLeft, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button } from '../../components/ui'
import { formatCOP, formatDate } from '../../lib/utils'
import type { ExpenseStatus } from '../../types'
import { deleteExpense } from './expenseService'
import { PaymentForm } from './PaymentForm'
import { useExpense } from './useExpense'
import { usePayments } from './usePayments'

const statusConfig: Record<
  ExpenseStatus,
  { label: string; variant: 'danger' | 'warning' | 'success' }
> = {
  pending: { label: 'Pendiente', variant: 'danger' },
  partial: { label: 'Parcial', variant: 'warning' },
  paid: { label: 'Pagado', variant: 'success' },
}

export function ExpenseDetail() {
  const { id = '', companyId = '' } = useParams<{
    id: string
    companyId: string
  }>()
  const navigate = useNavigate()
  const { expense, isLoading, refetch: refetchExpense } = useExpense(id)
  const { payments, refetch: refetchPayments } = usePayments(id)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!companyId || !id) return
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return

    setIsDeleting(true)
    try {
      await deleteExpense(companyId, id)
      navigate(`/${companyId}/expenses`)
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    refetchExpense()
    refetchPayments()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">
          Gasto no encontrado
        </h2>
        <Link
          to={`/${companyId}/expenses`}
          className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
        >
          Volver a gastos
        </Link>
      </div>
    )
  }

  const status = statusConfig[expense.status]
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = expense.totalAmount - totalPaid

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to={`/${companyId}/expenses`}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Detalle de Gasto</h1>
        <Badge variant={status.variant} className="ml-auto">
          {status.label}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Expense Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información
          </h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Proveedor</dt>
              <dd className="text-sm font-medium text-gray-900">
                {expense.provider?.name || expense.providerId}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Fecha</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(expense.date.toDate())}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Monto Total</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCOP(expense.totalAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Retenciones</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCOP(expense.taxDeductions)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Centro de Costo</dt>
              <dd className="text-sm font-medium text-gray-900">
                {expense.costCenter?.name || expense.costCenterId}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Descripción</dt>
              <dd className="text-sm font-medium text-gray-900">
                {expense.description || '-'}
              </dd>
            </div>
          </dl>

          {expense.invoiceUrl && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={expense.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Factura
              </a>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pagos</h2>
            {expense.status !== 'paid' && (
              <Button size="sm" onClick={() => setShowPaymentForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Registrar Pago
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCOP(expense.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pagado</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCOP(totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendiente</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCOP(remaining)}
              </p>
            </div>
          </div>

          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCOP(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(payment.date.toDate())}
                      {payment.notes && ` - ${payment.notes}`}
                    </p>
                  </div>
                  {payment.voucherUrl && (
                    <a
                      href={payment.voucherUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay pagos registrados
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Gasto
          </Button>
        </div>
      </div>

      {showPaymentForm && (
        <PaymentForm
          expenseId={id}
          maxAmount={remaining}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
