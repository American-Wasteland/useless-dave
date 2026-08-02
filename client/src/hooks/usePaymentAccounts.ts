import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../features/auth'
import { db } from '../lib/firebase'
import type { PaymentAccount } from '../types'

const getPaymentAccountsCollection = (companyId: string) =>
  collection(db, 'companies', companyId, 'paymentAccounts')

export function usePaymentAccounts() {
  const { companyId } = useAuth()
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPaymentAccounts = useCallback(async () => {
    if (!companyId) return

    setIsLoading(true)
    try {
      const q = query(getPaymentAccountsCollection(companyId), orderBy('name'))
      const snapshot = await getDocs(q)
      setPaymentAccounts(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as PaymentAccount,
        ),
      )
    } catch (error) {
      console.error('Error fetching payment accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  const createPaymentAccount = async (
    name: string,
    type: 'bank' | 'cash' | 'card',
    details?: string,
  ) => {
    if (!companyId) return

    await addDoc(getPaymentAccountsCollection(companyId), {
      name,
      type,
      details: details || null,
    })
    fetchPaymentAccounts()
  }

  const deletePaymentAccount = async (accountId: string) => {
    if (!companyId) return

    await deleteDoc(
      doc(db, 'companies', companyId, 'paymentAccounts', accountId),
    )
    fetchPaymentAccounts()
  }

  useEffect(() => {
    fetchPaymentAccounts()
  }, [fetchPaymentAccounts])

  return {
    paymentAccounts,
    isLoading,
    refetch: fetchPaymentAccounts,
    createPaymentAccount,
    deletePaymentAccount,
  }
}
