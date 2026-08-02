import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import {
  deleteAccountingCategory,
  getAccountingCategories,
  updateAccountingCategory,
} from '../shared/categoryService'
import { accountingCategoryKeys } from '../shared/queryKeys'
import type {
  AccountingCategory,
  UpdateAccountingCategoryInput,
} from '../shared/types'

export function useListCategories() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: accountingCategoryKeys.list(companyId || ''),
    queryFn: () => getAccountingCategories(companyId!),
    enabled: !!companyId,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string
      data: UpdateAccountingCategoryInput
    }) => updateAccountingCategory(companyId!, categoryId, data),
    onMutate: async ({ categoryId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<AccountingCategory[]>(
        accountingCategoryKeys.list(companyId!),
      )

      // Optimistically update
      queryClient.setQueryData<AccountingCategory[]>(
        accountingCategoryKeys.list(companyId!),
        (old) =>
          old?.map((cat) =>
            cat.id === categoryId ? { ...cat, ...data } : cat,
          ) ?? [],
      )

      return { previousCategories }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(
          accountingCategoryKeys.list(companyId!),
          context.previousCategories,
        )
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) =>
      deleteAccountingCategory(companyId!, categoryId),
    onMutate: async (categoryId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<AccountingCategory[]>(
        accountingCategoryKeys.list(companyId!),
      )

      // Optimistically remove
      queryClient.setQueryData<AccountingCategory[]>(
        accountingCategoryKeys.list(companyId!),
        (old) => old?.filter((cat) => cat.id !== categoryId) ?? [],
      )

      return { previousCategories }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(
          accountingCategoryKeys.list(companyId!),
          context.previousCategories,
        )
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })
    },
  })

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
