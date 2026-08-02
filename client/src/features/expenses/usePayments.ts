import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../hooks/useCompanyId'
import type { PaymentFormData } from '../../types'
import { createPayment, getPayments } from './expenseService'
import { expenseKeys } from './useExpenses'

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (companyId: string, expenseId: string) =>
    [...paymentKeys.lists(), companyId, expenseId] as const,
}

export function usePayments(expenseId: string) {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: paymentKeys.list(companyId || '', expenseId),
    queryFn: () => getPayments(companyId!, expenseId),
    enabled: !!companyId && !!expenseId,
  })

  return {
    payments: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useCreatePayment(expenseId: string) {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentFormData) =>
      createPayment(companyId!, expenseId, data),
    onSuccess: () => {
      // Invalidate payments list
      queryClient.invalidateQueries({
        queryKey: paymentKeys.list(companyId!, expenseId),
      })
      // Invalidate expense detail (status may have changed)
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(companyId!, expenseId),
      })
      // Invalidate expenses list (status may have changed)
      queryClient.invalidateQueries({
        queryKey: expenseKeys.list(companyId!),
      })
    },
  })
}
