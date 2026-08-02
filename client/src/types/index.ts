import type { Timestamp } from 'firebase/firestore'

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

export type PersonType = 'individual' | 'business'

export interface ThirdParty {
  id: string
  name: string
  type: PersonType
  documentNumber: string
  rutUrl?: string
  address?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface ProviderBankInfo {
  bankName: string
  accountType: 'ahorros' | 'corriente'
  accountNumber: string
}

export interface ProviderDefaultRetentions {
  retefuenteRate?: number
  appliesToReteIva?: boolean
  reteIcaRate?: number
}

export interface Provider extends ThirdParty {
  bankInfo?: ProviderBankInfo
  defaultRetentions?: ProviderDefaultRetentions
}

export interface Client extends ThirdParty {}

export type CostCenterType = 'project' | 'operation'
export type CostCenterStatus = 'active' | 'completed' | 'cancelled'

export interface CostCenter {
  id: string
  name: string
  description?: string
  type: CostCenterType
  client?: Client
  status: CostCenterStatus
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface PaymentAccount {
  id: string
  name: string
  type: 'bank' | 'cash' | 'card'
  details?: string
}

export type ExpenseWorkflowStatus =
  | 'draft'
  | 'requested'
  | 'approved'
  | 'paid'
  | 'closed'
export type PaymentStatus = 'pending' | 'partial' | 'paid'
export type ExpenseDocumentType =
  | 'quotation'
  | 'invoice'
  | 'cuenta_cobro'
  | 'voucher'
  | 'other'

export interface TaxRetentions {
  retefuente: number
  reteIva: number
  reteIca: number
}

export interface ExpenseDocument {
  id: string
  type: ExpenseDocumentType
  url: string
  fileName: string
  uploadedBy: string
  uploadedAt: Timestamp
  notes?: string
}

export interface StatusHistoryEntry {
  from: ExpenseWorkflowStatus | null
  to: ExpenseWorkflowStatus
  changedBy: string
  changedAt: Timestamp
  notes?: string
}

export interface Expense {
  id: string
  categoryId?: string
  costCenterId?: string
  providerId?: string
  labels: string[]
  subtotal: number
  ivaAmount: number
  totalAmount: number
  retentions: TaxRetentions
  netPayable: number
  description: string
  date: Timestamp
  paymentDueDate?: Timestamp
  workflowStatus: ExpenseWorkflowStatus
  paymentStatus: PaymentStatus
  statusHistory: StatusHistoryEntry[]
  requestedBy?: string
  approvedBy?: string
  paidBy?: string
  closedBy?: string
  documents: ExpenseDocument[]
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
  executedBy: string
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

export interface ThirdPartyFormData {
  name: string
  type: PersonType
  documentNumber: string
  rutFile?: File
  address?: string
  email?: string
  phone?: string
  isActive?: boolean
}

export interface ProviderFormData extends ThirdPartyFormData {
  bankInfo?: ProviderBankInfo
  defaultRetentions?: ProviderDefaultRetentions
}

export interface ClientFormData extends ThirdPartyFormData {}

// Chat types
export interface ChatToolCall {
  name: string
  input: Record<string, unknown>
  result: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ChatToolCall[]
  attachments?: ChatAttachment[]
  createdAt: Date
  isStreaming?: boolean
}

export interface ChatAttachment {
  type: 'invoice' | 'voucher'
  url: string
  name: string
  file?: File
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
