import { useCallback, useEffect, useState } from 'react'
import type { Payment } from '../../types'
import { useAuth } from '../auth'
import { getPayments } from './expenseService'

export function usePayments(expenseId: string) {
  const { companyId } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    if (!companyId || !expenseId) return

    setIsLoading(true)
    try {
      const data = await getPayments(companyId, expenseId)
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, expenseId])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return { payments, isLoading, refetch: fetchPayments }
}
