import type { Timestamp } from 'firebase/firestore'

export interface Company {
  id: string
  name: string
  createdAt: Timestamp
  settings?: {
    currency: 'COP'
  }
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  modules: {
    expenses?: 'edit' | 'view'
    incomes?: 'edit' | 'view'
    quotes?: 'edit' | 'view'
    invoices?: 'edit' | 'view'
    inventory?: 'edit' | 'view'
  }
}

export interface Provider {
  id: string
  name: string
  rut: string
  address?: string
  email?: string
  phone?: string
  createdAt: Timestamp
}

export interface CostCenter {
  id: string
  name: string
  description?: string
}

export interface PaymentAccount {
  id: string
  name: string
  type: 'bank' | 'cash' | 'card'
  details?: string
}

export type ExpenseStatus = 'pending' | 'partial' | 'paid'

export interface Expense {
  id: string
  providerId: string
  provider?: Provider
  totalAmount: number
  taxDeductions: number
  costCenterId: string
  costCenter?: CostCenter
  date: Timestamp
  description: string
  status: ExpenseStatus
  invoiceUrl?: string
  voucherUrl?: string
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Payment {
  id: string
  expenseId: string
  amount: number
  paymentAccountId: string
  paymentAccount?: PaymentAccount
  date: Timestamp
  notes?: string
  voucherUrl?: string
  createdAt: Timestamp
}

// Form types (without Firestore-specific fields)
export interface ExpenseFormData {
  providerId: string
  totalAmount: number
  taxDeductions: number
  costCenterId: string
  date: string
  description: string
  invoiceFile?: File
}

export interface PaymentFormData {
  amount: number
  paymentAccountId: string
  date: string
  notes?: string
  voucherFile?: File
}

export interface ProviderFormData {
  name: string
  rut: string
  address?: string
  email?: string
  phone?: string
}
