import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as bankAccountService from '../commands/bank-accounts/shared/bankAccountService'
import type {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from '../commands/bank-accounts/shared/types'
import { useCompanyId } from './useCompanyId'

export const bankAccountKeys = {
  all: ['bankAccounts'] as const,
  lists: () => [...bankAccountKeys.all, 'list'] as const,
  list: (companyId: string) => [...bankAccountKeys.lists(), companyId] as const,
  detail: (companyId: string, id: string) =>
    [...bankAccountKeys.all, 'detail', companyId, id] as const,
}

export async function getBankAccount(
  companyId: string,
  accountId: string,
): Promise<BankAccount | null> {
  try {
    return await bankAccountService.getBankAccountById(companyId, accountId)
  } catch (_error) {
    return null
  }
}

export function useBankAccounts() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: bankAccountKeys.list(companyId || ''),
    queryFn: () => bankAccountService.getBankAccounts(companyId!),
    enabled: !!companyId,
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateBankAccountInput) => {
      return bankAccountService.createBankAccount(companyId!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.list(companyId!),
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      accountId,
      data,
    }: {
      accountId: string
      data: UpdateBankAccountInput
    }) => {
      return bankAccountService.updateBankAccount(companyId!, accountId, data)
    },
    onMutate: async ({ accountId, data }) => {
      const key = bankAccountKeys.detail(companyId!, accountId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<BankAccount>(key)
      queryClient.setQueryData<BankAccount>(key, (old) =>
        old ? { ...old, name: data.name } : old,
      )
      return { previous, accountId }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          bankAccountKeys.detail(companyId!, context.accountId),
          context.previous,
        )
      }
    },
    onSettled: (_data, _err, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.detail(companyId!, accountId),
      })
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.list(companyId!),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return bankAccountService.deleteBankAccount(companyId!, accountId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.list(companyId!),
      })
    },
  })

  const uploadStatementMutation = useMutation({
    mutationFn: async ({
      accountId,
      month,
      file,
      uploadedBy,
    }: {
      accountId: string
      month: string
      file: File
      uploadedBy: string
    }) => {
      return bankAccountService.uploadStatement(
        companyId!,
        accountId,
        month,
        file,
        uploadedBy,
      )
    },
    onSuccess: (updatedAccount, { accountId }) => {
      queryClient.setQueryData(
        bankAccountKeys.detail(companyId!, accountId),
        updatedAccount,
      )
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.list(companyId!),
      })
    },
  })

  const deleteStatementMutation = useMutation({
    mutationFn: async ({
      accountId,
      month,
    }: {
      accountId: string
      month: string
    }) => {
      return bankAccountService.deleteStatement(companyId!, accountId, month)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.list(companyId!),
      })
    },
  })

  const createBankAccount = async (data: CreateBankAccountInput) => {
    await createMutation.mutateAsync(data)
  }

  const updateBankAccount = async (
    accountId: string,
    data: UpdateBankAccountInput,
  ) => {
    await updateMutation.mutateAsync({ accountId, data })
  }

  const deleteBankAccount = async (accountId: string) => {
    await deleteMutation.mutateAsync(accountId)
  }

  const uploadStatement = async (
    accountId: string,
    month: string,
    file: File,
    uploadedBy: string,
  ) => {
    await uploadStatementMutation.mutateAsync({
      accountId,
      month,
      file,
      uploadedBy,
    })
  }

  const deleteStatement = async (accountId: string, month: string) => {
    await deleteStatementMutation.mutateAsync({ accountId, month })
  }

  return {
    bankAccounts: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    uploadStatement,
    deleteStatement,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUploadingStatement: uploadStatementMutation.isPending,
  }
}
