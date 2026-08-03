import type { Entity } from './common.js'

export interface BankStatement {
  id: string
  month: string // Format: YYYY-MM
  fileUrl: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
}

export interface BankAccount extends Entity {
  name: string
  statements: BankStatement[]
}

export interface CreateBankAccountInput {
  name: string
}

export interface UpdateBankAccountInput {
  name: string
}

export interface UploadStatementInput {
  month: string // Format: YYYY-MM
  file: File
}
