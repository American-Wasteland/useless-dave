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

  // Tax rates
  vatRate?: number // VAT/IVA percentage (e.g., 19 = 19%)

  // Tax withholding rates (if both 0 or undefined, provider is autorretenedor)
  reteFuenteRate?: number // Percentage (e.g., 4 = 4%)
  reteIcaRate?: number // Per thousand (e.g., 9.66 = 9.66/1000)
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
  vatRate?: number
  reteFuenteRate?: number
  reteIcaRate?: number
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
  vatRate?: number
  reteFuenteRate?: number
  reteIcaRate?: number
}
