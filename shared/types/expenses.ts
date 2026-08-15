import type { Entity } from './common.js'

export interface ExpensePayment {
	id: string
	bankAccountId: string
	amount: number
	date: string // ISO string
	notes?: string
	proofUrl?: string // PDF proof of payment
	createdAt: string
}

export type PaymentStatus = 'pending' | 'partial' | 'paid'

export interface ExpenseFinancials {
	total: number // subtotal + iva
	amountToPay: number // total - reteFuente - reteIca
	totalPaid: number // sum of payments
	remainingBalance: number // amountToPay - totalPaid
}

export interface Expense extends Entity {
	title: string
	providerId: string
	categoryId: string
	costCenterId: string

	// Amounts
	// Total = subtotal + iva
	// Amount to pay = subtotal + iva - reteFuente - reteIca
	subtotal: number
	iva: number // VAT
	reteFuente?: number
	reteIca?: number

	// Documents
	invoiceUrl?: string // Invoice or 'cuenta de cobro' PDF (optional, can be added later)

	// Payments (stored in subcollection, populated on read)
	payments: ExpensePayment[]
	paymentStatus: PaymentStatus

	// Dates
	expenseDate: string // ISO string
}

export interface CreateExpenseInput {
	title: string
	providerId: string
	categoryId: string
	costCenterId: string
	subtotal: number
	iva: number
	reteFuente?: number
	reteIca?: number
	expenseDate: string
	paymentStatus?: PaymentStatus
}

export interface UpdateExpenseInput {
	title?: string
	providerId?: string
	categoryId?: string
	costCenterId?: string
	subtotal?: number
	iva?: number
	reteFuente?: number
	reteIca?: number
	expenseDate?: string
	invoiceUrl?: string
	paymentStatus?: PaymentStatus
}

export interface AddPaymentInput {
	bankAccountId: string
	amount: number
	date: string
	notes?: string
}
