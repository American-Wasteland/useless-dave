import { useQuery } from '@tanstack/react-query'
import { useCompanyId } from '../../hooks/useCompanyId'
import { getExpense } from './expenseService'
import { expenseKeys } from './useExpenses'

export function useExpense(expenseId: string) {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: expenseKeys.detail(companyId ?? '', expenseId),
    queryFn: () => getExpense(companyId!, expenseId),
    enabled: !!companyId && !!expenseId,
  })

  return {
    expense: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
