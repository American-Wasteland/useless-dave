import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../hooks/useCompanyId'
import {
  createAccountingCategory,
  deleteAccountingCategory,
  getAccountingCategories,
  updateAccountingCategory,
} from './categoryService'

export const accountingCategoryKeys = {
  all: ['accountingCategories'] as const,
  lists: () => [...accountingCategoryKeys.all, 'list'] as const,
  list: (companyId: string) =>
    [...accountingCategoryKeys.lists(), companyId] as const,
}

export function useAccountingCategories() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: accountingCategoryKeys.list(companyId || ''),
    queryFn: () => getAccountingCategories(companyId!),
    enabled: !!companyId,
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createAccountingCategory(companyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string
      data: { name?: string; description?: string; isActive?: boolean }
    }) => updateAccountingCategory(companyId!, categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) =>
      deleteAccountingCategory(companyId!, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })
    },
  })

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
