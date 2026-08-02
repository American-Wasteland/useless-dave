import type { Entity } from './common.js'

export type ProviderType = 'business' | 'natural-person'

/**
 * Provider DTO (data transfer object)
 * Used for API requests/responses
 */
export interface Provider extends Entity {
  name: string
  nit: string // Tax ID number
  providerType: ProviderType // Business or natural person
  contactName?: string // Contact person name
  email?: string
  phone?: string
  address?: string
  rutUrl?: string // Firebase Storage URL for RUT document (PDF)
  bankAccountUrl?: string // Firebase Storage URL for bank account document (PDF)
  isActive: boolean
}

export interface CreateProviderInput {
  name: string
  nit: string
  providerType: ProviderType
  contactName?: string
  email?: string
  phone?: string
  address?: string
  rutUrl?: string
  bankAccountUrl?: string
}

export interface UpdateProviderInput {
  name?: string
  nit?: string
  providerType?: ProviderType
  contactName?: string
  email?: string
  phone?: string
  address?: string
  rutUrl?: string
  bankAccountUrl?: string
  isActive?: boolean
}
