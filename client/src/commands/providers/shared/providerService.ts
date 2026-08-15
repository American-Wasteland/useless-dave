import { apiRequest } from './api'
import type {
  CreateProviderInput,
  Provider,
  UpdateProviderInput,
} from './types'

export async function getProviders(companyId: string): Promise<Provider[]> {
  return apiRequest<Provider[]>(`/companies/${companyId}/providers`)
}

export async function getProviderById(
  companyId: string,
  providerId: string,
): Promise<Provider> {
  return apiRequest<Provider>(`/companies/${companyId}/providers/${providerId}`)
}

export async function createProvider(
  companyId: string,
  data: CreateProviderInput,
  files?: { rut?: File; bankAccount?: File },
): Promise<Provider> {
  // Create FormData for multipart/form-data request
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('nit', data.nit)
  formData.append('providerType', data.providerType)
  if (data.contactName) formData.append('contactName', data.contactName)
  if (data.email) formData.append('email', data.email)
  if (data.phone) formData.append('phone', data.phone)
  if (data.address) formData.append('address', data.address)
  if (data.vatRate !== undefined)
    formData.append('vatRate', String(data.vatRate))
  if (data.reteFuenteRate !== undefined)
    formData.append('reteFuenteRate', String(data.reteFuenteRate))
  if (data.reteIcaRate !== undefined)
    formData.append('reteIcaRate', String(data.reteIcaRate))
  if (files?.rut) formData.append('rut', files.rut)
  if (files?.bankAccount) formData.append('bankAccount', files.bankAccount)

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/companies/${companyId}/providers`,
    {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - browser will set it with boundary
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create provider')
  }

  return response.json()
}

export async function updateProvider(
  companyId: string,
  providerId: string,
  data: UpdateProviderInput,
  files?: { rut?: File; bankAccount?: File },
): Promise<Provider> {
  // If files are provided, use FormData
  if (files?.rut || files?.bankAccount) {
    const formData = new FormData()

    // Add all data fields
    if (data.name) formData.append('name', data.name)
    if (data.nit) formData.append('nit', data.nit)
    if (data.providerType) formData.append('providerType', data.providerType)
    if (data.contactName) formData.append('contactName', data.contactName)
    if (data.email) formData.append('email', data.email)
    if (data.phone) formData.append('phone', data.phone)
    if (data.address) formData.append('address', data.address)
    if (data.vatRate !== undefined)
      formData.append('vatRate', String(data.vatRate))
    if (data.reteFuenteRate !== undefined)
      formData.append('reteFuenteRate', String(data.reteFuenteRate))
    if (data.reteIcaRate !== undefined)
      formData.append('reteIcaRate', String(data.reteIcaRate))
    // Add file URLs if setting to null
    if (data.rutUrl === null) formData.append('rutUrl', 'null')
    if (data.bankAccountUrl === null) formData.append('bankAccountUrl', 'null')

    // Add files
    if (files.rut) formData.append('rut', files.rut)
    if (files.bankAccount) formData.append('bankAccount', files.bankAccount)

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/companies/${companyId}/providers/${providerId}`,
      {
        method: 'PATCH',
        body: formData,
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update provider')
    }

    return response.json()
  }

  // Otherwise use JSON
  return apiRequest<Provider>(
    `/companies/${companyId}/providers/${providerId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )
}

export async function deleteProvider(
  companyId: string,
  providerId: string,
): Promise<void> {
  return apiRequest<void>(`/companies/${companyId}/providers/${providerId}`, {
    method: 'DELETE',
  })
}

export async function searchProviders(
  companyId: string,
  query: string,
): Promise<Provider[]> {
  return apiRequest<Provider[]>(
    `/companies/${companyId}/providers/search/${encodeURIComponent(query)}`,
  )
}
