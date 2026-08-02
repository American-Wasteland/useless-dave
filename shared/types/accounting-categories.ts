import type { Entity } from './common.js'

/**
 * Accounting Category DTO (data transfer object)
 * Used for API requests/responses
 */
export interface AccountingCategory extends Entity {
  name: string
  description?: string
  isActive: boolean
}

export interface CreateAccountingCategoryInput {
  name: string
  description?: string
}

export interface UpdateAccountingCategoryInput {
  name?: string
  description?: string
  isActive?: boolean
}
