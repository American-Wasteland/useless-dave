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
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../features/auth'
import { db } from '../lib/firebase'
import type { CostCenter } from '../types'

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

export function useCostCenters() {
  const { companyId } = useAuth()
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCostCenters = useCallback(async () => {
    if (!companyId) return

    setIsLoading(true)
    try {
      const q = query(getCostCentersCollection(companyId), orderBy('name'))
      const snapshot = await getDocs(q)
      setCostCenters(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as CostCenter,
        ),
      )
    } catch (error) {
      console.error('Error fetching cost centers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  const createCostCenter = async (name: string, description?: string) => {
    if (!companyId) return

    await addDoc(getCostCentersCollection(companyId), {
      name,
      description: description || null,
    })
    fetchCostCenters()
  }

  const deleteCostCenter = async (costCenterId: string) => {
    if (!companyId) return

    await deleteDoc(
      doc(db, 'companies', companyId, 'costCenters', costCenterId),
    )
    fetchCostCenters()
  }

  useEffect(() => {
    fetchCostCenters()
  }, [fetchCostCenters])

  return {
    costCenters,
    isLoading,
    refetch: fetchCostCenters,
    createCostCenter,
    deleteCostCenter,
  }
}
