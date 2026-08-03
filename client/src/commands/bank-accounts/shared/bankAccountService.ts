import { apiRequest, apiUpload } from './api'
import type {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from './types'

export async function getBankAccounts(
  companyId: string,
): Promise<BankAccount[]> {
  return apiRequest<BankAccount[]>(`/companies/${companyId}/bank-accounts`)
}

export async function getBankAccountById(
  companyId: string,
  accountId: string,
): Promise<BankAccount> {
  return apiRequest<BankAccount>(
    `/companies/${companyId}/bank-accounts/${accountId}`,
  )
}

export async function createBankAccount(
  companyId: string,
  data: CreateBankAccountInput,
): Promise<BankAccount> {
  return apiRequest<BankAccount>(`/companies/${companyId}/bank-accounts`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBankAccount(
  companyId: string,
  accountId: string,
  data: UpdateBankAccountInput,
): Promise<BankAccount> {
  return apiRequest<BankAccount>(
    `/companies/${companyId}/bank-accounts/${accountId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )
}

export async function deleteBankAccount(
  companyId: string,
  accountId: string,
): Promise<void> {
  return apiRequest<void>(
    `/companies/${companyId}/bank-accounts/${accountId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function uploadStatement(
  companyId: string,
  accountId: string,
  month: string,
  file: File,
  uploadedBy: string,
): Promise<BankAccount> {
  const formData = new FormData()
  formData.append('statement', file)
  formData.append('month', month)
  formData.append('uploadedBy', uploadedBy)

  return apiUpload<BankAccount>(
    `/companies/${companyId}/bank-accounts/${accountId}/statements`,
    formData,
  )
}

export async function deleteStatement(
  companyId: string,
  accountId: string,
  month: string,
): Promise<BankAccount> {
  return apiRequest<BankAccount>(
    `/companies/${companyId}/bank-accounts/${accountId}/statements/${month}`,
    {
      method: 'DELETE',
    },
  )
}

export async function searchBankAccounts(
  companyId: string,
  query: string,
): Promise<BankAccount[]> {
  return apiRequest<BankAccount[]>(
    `/companies/${companyId}/bank-accounts/search/${encodeURIComponent(query)}`,
  )
}
