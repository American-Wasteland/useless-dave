import { useQuery } from '@tanstack/react-query'
import { useCompanyId } from '../../hooks/useCompanyId'
import { getCostCenter } from '../../hooks/useCostCenters'
import type { Expense } from '../../types'
import { getProvider } from '../providers/providerService'
import { getExpense } from './expenseService'
import { expenseKeys } from './useExpenses'

async function fetchExpenseWithRelations(
  companyId: string,
  expenseId: string,
): Promise<Expense | null> {
  const data = await getExpense(companyId, expenseId)

  if (!data) return null

  const [provider, costCenter] = await Promise.all([
    getProvider(companyId, data.providerId).catch(() => null),
    getCostCenter(companyId, data.costCenterId).catch(() => null),
  ])

  return {
    ...data,
    provider: provider || undefined,
    costCenter: costCenter || undefined,
  }
}

export function useExpense(expenseId: string) {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: expenseKeys.detail(companyId || '', expenseId),
    queryFn: () => fetchExpenseWithRelations(companyId!, expenseId),
    enabled: !!companyId && !!expenseId,
  })

  return {
    expense: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
