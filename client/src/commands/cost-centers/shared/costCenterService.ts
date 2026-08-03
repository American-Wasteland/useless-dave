import { apiRequest } from './api'
import type {
  CostCenter,
  CreateCostCenterInput,
  UpdateCostCenterInput,
} from './types'

export async function getCostCenters(companyId: string): Promise<CostCenter[]> {
  return apiRequest<CostCenter[]>(`/companies/${companyId}/cost-centers`)
}

export async function getCostCenterById(
  companyId: string,
  costCenterId: string,
): Promise<CostCenter> {
  return apiRequest<CostCenter>(
    `/companies/${companyId}/cost-centers/${costCenterId}`,
  )
}

export async function createCostCenter(
  companyId: string,
  data: CreateCostCenterInput,
): Promise<CostCenter> {
  return apiRequest<CostCenter>(`/companies/${companyId}/cost-centers`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCostCenter(
  companyId: string,
  costCenterId: string,
  data: UpdateCostCenterInput,
): Promise<CostCenter> {
  return apiRequest<CostCenter>(
    `/companies/${companyId}/cost-centers/${costCenterId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )
}

export async function deleteCostCenter(
  companyId: string,
  costCenterId: string,
): Promise<void> {
  return apiRequest<void>(
    `/companies/${companyId}/cost-centers/${costCenterId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function searchCostCenters(
  companyId: string,
  query: string,
): Promise<CostCenter[]> {
  return apiRequest<CostCenter[]>(
    `/companies/${companyId}/cost-centers/search/${encodeURIComponent(query)}`,
  )
}
