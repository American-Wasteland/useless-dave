import type { Timestamp } from 'firebase-admin/firestore'

export interface Company {
  id: string
  name: string
  logoUrl?: string
  createdAt: Timestamp
  createdBy: string
  settings?: {
    currency: 'COP'
  }
}

export interface CompanyMembership {
  companyId: string
  role: 'admin' | 'editor' | 'viewer'
  joinedAt: Timestamp
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
  totalAmount: number
  taxDeductions: number
  costCenterId: string
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
  date: Timestamp
  notes?: string
  voucherUrl?: string
  createdAt: Timestamp
}
