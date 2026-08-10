import type { Entity } from './common.js'

export interface BankStatement {
  id: string
  month: string // Format: YYYY-MM
  fileUrl: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
}

export interface BankMovement {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string // ISO string
  referenceType: 'expense' | 'income'
  createdAt: string
  createdBy: string
}

export interface BankAccount extends Entity {
  name: string
  initialBalance: number
  currentBalance: number
  statements: BankStatement[]
}

export interface CreateBankAccountInput {
  name: string
  initialBalance: number
}

export interface UpdateBankAccountInput {
  name: string
}

export interface UploadStatementInput {
  month: string // Format: YYYY-MM
  file: File
}
