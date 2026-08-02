import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { PaymentAccount } from '../types'
import { useCompanyId } from './useCompanyId'

const getPaymentAccountsCollection = (companyId: string) =>
  collection(db, 'companies', companyId, 'paymentAccounts')

async function fetchPaymentAccounts(
  companyId: string,
): Promise<PaymentAccount[]> {
  const q = query(getPaymentAccountsCollection(companyId), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as PaymentAccount,
  )
}

export const paymentAccountKeys = {
  all: ['paymentAccounts'] as const,
  lists: () => [...paymentAccountKeys.all, 'list'] as const,
  list: (companyId: string) =>
    [...paymentAccountKeys.lists(), companyId] as const,
}

export function usePaymentAccounts() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: paymentAccountKeys.list(companyId || ''),
    queryFn: () => fetchPaymentAccounts(companyId!),
    enabled: !!companyId,
  })

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      type,
      details,
    }: {
      name: string
      type: 'bank' | 'cash' | 'card'
      details?: string
    }) => {
      await addDoc(getPaymentAccountsCollection(companyId!), {
        name,
        type,
        details: details || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentAccountKeys.list(companyId!),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      await deleteDoc(
        doc(db, 'companies', companyId!, 'paymentAccounts', accountId),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentAccountKeys.list(companyId!),
      })
    },
  })

  const createPaymentAccount = async (
    name: string,
    type: 'bank' | 'cash' | 'card',
    details?: string,
  ) => {
    await createMutation.mutateAsync({ name, type, details })
  }

  const deletePaymentAccount = async (accountId: string) => {
    await deleteMutation.mutateAsync(accountId)
  }

  return {
    paymentAccounts: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createPaymentAccount,
    deletePaymentAccount,
  }
}
