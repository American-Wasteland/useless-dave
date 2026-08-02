import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { CostCenter } from '../types'
import { useCompanyId } from './useCompanyId'

const getCostCentersCollection = (companyId: string) =>
  collection(db, 'companies', companyId, 'costCenters')

export async function getCostCenter(
  companyId: string,
  costCenterId: string,
): Promise<CostCenter | null> {
  const docRef = doc(db, 'companies', companyId, 'costCenters', costCenterId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as CostCenter
}

async function fetchCostCenters(companyId: string): Promise<CostCenter[]> {
  const q = query(getCostCentersCollection(companyId), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as CostCenter,
  )
}

export const costCenterKeys = {
  all: ['costCenters'] as const,
  lists: () => [...costCenterKeys.all, 'list'] as const,
  list: (companyId: string) => [...costCenterKeys.lists(), companyId] as const,
}

export function useCostCenters() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: costCenterKeys.list(companyId || ''),
    queryFn: () => fetchCostCenters(companyId!),
    enabled: !!companyId,
  })

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string
      description?: string
    }) => {
      await addDoc(getCostCentersCollection(companyId!), {
        name,
        description: description || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: costCenterKeys.list(companyId!),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (costCenterId: string) => {
      await deleteDoc(
        doc(db, 'companies', companyId!, 'costCenters', costCenterId),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: costCenterKeys.list(companyId!),
      })
    },
  })

  const createCostCenter = async (name: string, description?: string) => {
    await createMutation.mutateAsync({ name, description })
  }

  const deleteCostCenter = async (costCenterId: string) => {
    await deleteMutation.mutateAsync(costCenterId)
  }

  return {
    costCenters: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createCostCenter,
    deleteCostCenter,
  }
}
