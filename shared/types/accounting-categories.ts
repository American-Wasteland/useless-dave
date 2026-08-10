import type { Entity } from './common.js'

/**
 * Accounting Category DTO (data transfer object)
 * Used for API requests/responses
 */
export interface AccountingCategory extends Entity {
  name: string
}

export interface CreateAccountingCategoryInput {
  name: string
}

export interface UpdateAccountingCategoryInput {
  name?: string
}
