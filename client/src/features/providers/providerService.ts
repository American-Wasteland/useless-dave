import {
  addDoc,
  collection,
  type DocumentReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Provider, ProviderFormData } from '../../types'

const getProvidersCollection = (companyId: string) =>
  collection(db, 'companies', companyId, 'providers')

export async function getProviders(companyId: string): Promise<Provider[]> {
  const q = query(getProvidersCollection(companyId), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Provider)
}

export async function getProvider(
  companyId: string,
  providerId: string,
): Promise<Provider | null> {
  const docRef = doc(db, 'companies', companyId, 'providers', providerId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as Provider
}

export async function createProvider(
  companyId: string,
  data: ProviderFormData,
): Promise<DocumentReference> {
  const provider = {
    name: data.name,
    documentNumber: data.documentNumber,
    address: data.address || null,
    email: data.email || null,
    phone: data.phone || null,
    createdAt: serverTimestamp(),
  }

  return addDoc(getProvidersCollection(companyId), provider)
}

export async function updateProvider(
  companyId: string,
  providerId: string,
  data: Partial<ProviderFormData>,
): Promise<void> {
  const docRef = doc(db, 'companies', companyId, 'providers', providerId)
  await updateDoc(docRef, data)
}

export async function deleteProvider(
  companyId: string,
  providerId: string,
): Promise<void> {
  const docRef = doc(db, 'companies', companyId, 'providers', providerId)
  await deleteDoc(docRef)
}
