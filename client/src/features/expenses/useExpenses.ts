import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../hooks/useCompanyId'
import type { ExpenseFormData } from '../../types'
import { createExpense, deleteExpense, getExpenses } from './expenseService'

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (companyId: string) => [...expenseKeys.lists(), companyId] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (companyId: string, id: string) =>
    [...expenseKeys.details(), companyId, id] as const,
}

export function useExpenses() {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: expenseKeys.list(companyId || ''),
    queryFn: () => getExpenses(companyId!),
    enabled: !!companyId,
  })

  return {
    expenses: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useCreateExpense() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ExpenseFormData }) =>
      createExpense(companyId!, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.list(companyId!) })
    },
  })
}

export function useDeleteExpense() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(companyId!, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.list(companyId!) })
    },
  })
}
