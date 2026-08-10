import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Company } from '../../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function createCompany(
  userId: string,
  name: string,
  logoFile?: File,
): Promise<Company> {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('userId', userId)
  if (logoFile) {
    formData.append('logo', logoFile)
  }

  const response = await fetch(`${API_BASE_URL}/companies`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Error al crear la empresa')
  }

  return response.json()
}

export async function getUserCompanies(userId: string): Promise<Company[]> {
  // Get all memberships for this user
  const membershipsRef = collection(db, 'users', userId, 'memberships')
  const membershipsSnap = await getDocs(membershipsRef)

  if (membershipsSnap.empty) {
    return []
  }

  // Fetch all company documents
  const companies: Company[] = []

  for (const membershipDoc of membershipsSnap.docs) {
    const companyId = membershipDoc.id // Use doc ID directly

    try {
      const companyRef = doc(db, 'companies', companyId)
      const companySnap = await getDoc(companyRef)

      if (companySnap.exists()) {
        companies.push({
          id: companySnap.id,
          ...companySnap.data(),
        } as Company)
      }
    } catch (error) {
      console.error('Error fetching company:', companyId, error)
    }
  }

  return companies
}

export async function getCompany(companyId: string): Promise<Company | null> {
  const companyRef = doc(db, 'companies', companyId)
  const companySnap = await getDoc(companyRef)

  if (!companySnap.exists()) {
    return null
  }

  return {
    id: companySnap.id,
    ...companySnap.data(),
  } as Company
}

export async function isUserMemberOfCompany(
  userId: string,
  companyId: string,
): Promise<boolean> {
  const membershipRef = doc(db, 'users', userId, 'memberships', companyId)
  const membershipSnap = await getDoc(membershipRef)
  return membershipSnap.exists()
}
