import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '../../types'
import { useAuth } from '../auth'
import { getProvider } from '../providers/providerService'
import { getExpenses } from './expenseService'

export function useExpenses() {
  const { companyId } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    if (!companyId) return

    setIsLoading(true)
    try {
      const data = await getExpenses(companyId)

      // Enrich with provider data
      const enriched = await Promise.all(
        data.map(async (expense) => {
          try {
            const provider = await getProvider(companyId, expense.providerId)
            return { ...expense, provider: provider || undefined }
          } catch {
            return expense
          }
        }),
      )

      setExpenses(enriched)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return { expenses, isLoading, refetch: fetchExpenses }
}
