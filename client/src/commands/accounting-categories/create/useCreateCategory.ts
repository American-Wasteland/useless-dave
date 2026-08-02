import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { createAccountingCategory } from '../shared/categoryService'
import { accountingCategoryKeys } from '../shared/queryKeys'
import type { CreateAccountingCategoryInput } from '../shared/types'

export function useCreateCategory() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateAccountingCategoryInput) =>
      createAccountingCategory(companyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountingCategoryKeys.list(companyId!),
      })
    },
  })

  return {
    createCategory: async (data: CreateAccountingCategoryInput) => {
      await mutation.mutateAsync(data)
    },
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}
