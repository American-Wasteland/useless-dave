import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button, ConfirmModal, Currency } from '../../../../components/ui'
import { useCompanyId } from '../../../../hooks/useCompanyId'
import { addPayment, deletePayment } from '../../shared/expenseService'
import type {
  AddPaymentInput,
  Expense,
  ExpensePayment,
} from '../../shared/types'
import { AddPaymentForm } from './AddPaymentForm'

export function PaymentsTab() {
  const { expense } = useOutletContext<{ expense: Expense }>()
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    paymentId: string
    amount: number
  } | null>(null)

  const addMutation = useMutation({
    mutationFn: async ({
      data,
      proofFile,
    }: {
      data: AddPaymentInput
      proofFile?: File
    }) => {
      return addPayment(companyId!, expense.id, data, proofFile)
    },
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData(
        ['expenses', companyId, expense.id],
        updatedExpense,
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return deletePayment(companyId!, expense.id, paymentId)
    },
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData(
        ['expenses', companyId, expense.id],
        updatedExpense,
      )
      setDeleteConfirm(null)
    },
  })

  const handleAddPayment = async (data: AddPaymentInput, proofFile?: File) => {
    await addMutation.mutateAsync({ data, proofFile })
    setIsAddModalOpen(false)
  }

  const handleDeleteClick = (payment: ExpensePayment) => {
    setDeleteConfirm({ paymentId: payment.id, amount: payment.amount })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    await deleteMutation.mutateAsync(deleteConfirm.paymentId)
  }

  const sortedPayments = [...expense.payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900">
          Pagos realizados
        </h3>
        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar pago
        </Button>
      </div>

      {sortedPayments.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-gray-500">
            No hay pagos registrados para este gasto
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPayments.map((payment) => (
            <div key={payment.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      <Currency amount={payment.amount} />
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(payment.date).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Cuenta:{' '}
                      <span className="text-gray-700">
                        {payment.bankAccountId}
                      </span>
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-gray-600 italic">
                        {payment.notes}
                      </p>
                    )}
                    {payment.proofUrl && (
                      <a
                        href={payment.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver comprobante
                      </a>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteClick(payment)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPaymentForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPayment}
        isSubmitting={addMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar pago"
        message={`¿Estás seguro de que deseas eliminar el pago de ${deleteConfirm?.amount ? `$${deleteConfirm.amount.toLocaleString('es-CO')}` : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
