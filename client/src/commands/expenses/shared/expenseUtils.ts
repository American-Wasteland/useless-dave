import type { Expense, ExpenseFinancials, PaymentStatus } from './types'

/**
 * Calculate all financial values for an expense
 */
export function calculateExpenseFinancials(
  expense: Expense,
): ExpenseFinancials {
  const total = expense.subtotal + expense.iva
  const amountToPay = total - (expense.reteFuente ?? 0) - (expense.reteIca ?? 0)
  const totalPaid = expense.payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingBalance = amountToPay - totalPaid

  return {
    total,
    amountToPay,
    totalPaid,
    remainingBalance,
  }
}

/**
 * Get payment status badge color
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'partial':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending':
      return 'bg-red-100 text-red-800'
  }
}

/**
 * Get payment status label in Spanish
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'Pagado'
    case 'partial':
      return 'Parcial'
    case 'pending':
      return 'Pendiente'
  }
}
