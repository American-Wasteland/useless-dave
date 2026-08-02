import { apiRequest } from './api'
import type {
  AccountingCategory,
  CreateAccountingCategoryInput,
  UpdateAccountingCategoryInput,
} from './types'

export async function getAccountingCategories(
  companyId: string,
): Promise<AccountingCategory[]> {
  return apiRequest<AccountingCategory[]>(
    `/companies/${companyId}/accounting-categories`,
  )
}

export async function createAccountingCategory(
  companyId: string,
  data: CreateAccountingCategoryInput,
): Promise<AccountingCategory> {
  return apiRequest<AccountingCategory>(
    `/companies/${companyId}/accounting-categories`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}

export async function updateAccountingCategory(
  companyId: string,
  categoryId: string,
  data: UpdateAccountingCategoryInput,
): Promise<AccountingCategory> {
  return apiRequest<AccountingCategory>(
    `/companies/${companyId}/accounting-categories/${categoryId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )
}

export async function deleteAccountingCategory(
  companyId: string,
  categoryId: string,
): Promise<void> {
  return apiRequest<void>(
    `/companies/${companyId}/accounting-categories/${categoryId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function searchAccountingCategories(
  companyId: string,
  query: string,
): Promise<AccountingCategory[]> {
  return apiRequest<AccountingCategory[]>(
    `/companies/${companyId}/accounting-categories/search/${encodeURIComponent(query)}`,
  )
}
