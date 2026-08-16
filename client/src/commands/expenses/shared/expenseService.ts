import { apiRequest } from '../../../lib/api'
import type {
  AddPaymentInput,
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function getExpenses(
  companyId: string,
  options?: { from?: string; to?: string; search?: string },
): Promise<Expense[]> {
  const params = new URLSearchParams()
  if (options?.from) params.set('from', options.from)
  if (options?.to) params.set('to', options.to)
  if (options?.search) params.set('q', options.search)
  const qs = params.toString()
  return apiRequest<Expense[]>(
    `/companies/${companyId}/expenses${qs ? `?${qs}` : ''}`,
  )
}

export async function getExpenseById(
  companyId: string,
  expenseId: string,
): Promise<Expense> {
  return apiRequest<Expense>(`/companies/${companyId}/expenses/${expenseId}`)
}

export async function createExpense(
  companyId: string,
  data: CreateExpenseInput,
  invoiceFile?: File,
  paymentsData?: Array<{
    data: AddPaymentInput
    proofFile?: File
  }>,
): Promise<Expense> {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('providerId', data.providerId)
  formData.append('categoryId', data.categoryId)
  formData.append('costCenterId', data.costCenterId)
  formData.append('subtotal', String(data.subtotal))
  formData.append('iva', String(data.iva))
  if (data.reteFuente !== undefined)
    formData.append('reteFuente', String(data.reteFuente))
  if (data.reteIca !== undefined)
    formData.append('reteIca', String(data.reteIca))
  formData.append('expenseDate', data.expenseDate)
  if (data.paymentStatus) formData.append('paymentStatus', data.paymentStatus)
  if (invoiceFile) formData.append('invoice', invoiceFile)

  // Add payments data if provided
  if (paymentsData && paymentsData.length > 0) {
    const paymentsJson = paymentsData.map((p) => ({
      bankAccountId: p.data.bankAccountId,
      amount: p.data.amount,
      date: p.data.date,
      notes: p.data.notes || '',
    }))
    formData.append('payments', JSON.stringify(paymentsJson))

    // Add proof files with indexed field names
    paymentsData.forEach((payment, index) => {
      if (payment.proofFile) {
        formData.append(`payment-proof-${index}`, payment.proofFile)
      }
    })
  }

  const response = await fetch(
    `${API_BASE_URL}/companies/${companyId}/expenses`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create expense')
  }

  return response.json()
}

export async function updateExpense(
  companyId: string,
  expenseId: string,
  data: UpdateExpenseInput,
  invoiceFile?: File,
  paymentsData?: Array<{ data: AddPaymentInput; proofFile?: File }>,
  deletedPaymentIds?: string[],
): Promise<Expense> {
  const formData = new FormData()
  if (data.title !== undefined) formData.append('title', data.title)
  if (data.providerId !== undefined)
    formData.append('providerId', data.providerId)
  if (data.categoryId !== undefined)
    formData.append('categoryId', data.categoryId)
  if (data.costCenterId !== undefined)
    formData.append('costCenterId', data.costCenterId)
  if (data.subtotal !== undefined)
    formData.append('subtotal', String(data.subtotal))
  if (data.iva !== undefined) formData.append('iva', String(data.iva))
  if (data.reteFuente !== undefined)
    formData.append('reteFuente', String(data.reteFuente))
  if (data.reteIca !== undefined)
    formData.append('reteIca', String(data.reteIca))
  if (data.expenseDate !== undefined)
    formData.append('expenseDate', data.expenseDate)
  if (data.paymentStatus !== undefined)
    formData.append('paymentStatus', data.paymentStatus)
  if (invoiceFile) formData.append('invoice', invoiceFile)

  if (paymentsData && paymentsData.length > 0) {
    const paymentsJson = paymentsData.map((p) => ({
      bankAccountId: p.data.bankAccountId,
      amount: p.data.amount,
      date: p.data.date,
      notes: p.data.notes || '',
    }))
    formData.append('payments', JSON.stringify(paymentsJson))
    paymentsData.forEach((payment, index) => {
      if (payment.proofFile) {
        formData.append(`payment-proof-${index}`, payment.proofFile)
      }
    })
  }

  if (deletedPaymentIds && deletedPaymentIds.length > 0) {
    formData.append('deletedPaymentIds', JSON.stringify(deletedPaymentIds))
  }

  const response = await fetch(
    `${API_BASE_URL}/companies/${companyId}/expenses/${expenseId}`,
    {
      method: 'PATCH',
      body: formData,
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update expense')
  }

  return response.json()
}

export async function deleteExpense(
  companyId: string,
  expenseId: string,
): Promise<void> {
  return apiRequest<void>(`/companies/${companyId}/expenses/${expenseId}`, {
    method: 'DELETE',
  })
}

export async function searchExpenses(
  companyId: string,
  query: string,
): Promise<Expense[]> {
  return apiRequest<Expense[]>(
    `/companies/${companyId}/expenses/search/${encodeURIComponent(query)}`,
  )
}

export async function addPayment(
  companyId: string,
  expenseId: string,
  data: AddPaymentInput,
  proofFile?: File,
): Promise<Expense> {
  const formData = new FormData()
  formData.append('bankAccountId', data.bankAccountId)
  formData.append('amount', String(data.amount))
  formData.append('date', data.date)
  if (data.notes) formData.append('notes', data.notes)
  if (proofFile) formData.append('proof', proofFile)

  const response = await fetch(
    `${API_BASE_URL}/companies/${companyId}/expenses/${expenseId}/payments`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to add payment')
  }

  return response.json()
}

export async function deletePayment(
  companyId: string,
  expenseId: string,
  paymentId: string,
): Promise<Expense> {
  return apiRequest<Expense>(
    `/companies/${companyId}/expenses/${expenseId}/payments/${paymentId}`,
    {
      method: 'DELETE',
    },
  )
}
