import { useCallback, useEffect, useState } from 'react'
import { getCostCenter } from '../../hooks/useCostCenters'
import type { Expense } from '../../types'
import { useAuth } from '../auth'
import { getProvider } from '../providers/providerService'
import { getExpense } from './expenseService'

export function useExpense(expenseId: string) {
  const { companyId } = useAuth()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchExpense = useCallback(async () => {
    if (!companyId || !expenseId) return

    setIsLoading(true)
    try {
      const data = await getExpense(companyId, expenseId)

      if (data) {
        // Enrich with provider and cost center data
        const [provider, costCenter] = await Promise.all([
          getProvider(companyId, data.providerId).catch(() => null),
          getCostCenter(companyId, data.costCenterId).catch(() => null),
        ])

        setExpense({
          ...data,
          provider: provider || undefined,
          costCenter: costCenter || undefined,
        })
      } else {
        setExpense(null)
      }
    } catch (error) {
      console.error('Error fetching expense:', error)
      setExpense(null)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, expenseId])

  useEffect(() => {
    fetchExpense()
  }, [fetchExpense])

  return { expense, isLoading, refetch: fetchExpense }
}
