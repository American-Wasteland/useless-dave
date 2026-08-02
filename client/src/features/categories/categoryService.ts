import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Category } from '../../types'

const getAccountingCategoriesCollection = (companyId: string) =>
  collection(db, 'companies', companyId, 'accountingCategories')

const getExpensesCollection = (companyId: string) =>
  collection(db, 'companies', companyId, 'expenses')

export async function getAccountingCategories(
  companyId: string,
): Promise<Category[]> {
  const q = query(getAccountingCategoriesCollection(companyId), orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category)
}

export async function createAccountingCategory(
  companyId: string,
  data: { name: string; description?: string },
): Promise<string> {
  const docRef = await addDoc(getAccountingCategoriesCollection(companyId), {
    name: data.name,
    description: data.description || null,
    isActive: true,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateAccountingCategory(
  companyId: string,
  categoryId: string,
  data: { name?: string; description?: string; isActive?: boolean },
): Promise<void> {
  const docRef = doc(
    db,
    'companies',
    companyId,
    'accountingCategories',
    categoryId,
  )
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteAccountingCategory(
  companyId: string,
  categoryId: string,
): Promise<void> {
  const expensesQuery = query(
    getExpensesCollection(companyId),
    where('categoryId', '==', categoryId),
    limit(1),
  )
  const snapshot = await getDocs(expensesQuery)

  if (!snapshot.empty) {
    throw new Error('Cannot delete a category that has associated expenses')
  }

  const docRef = doc(
    db,
    'companies',
    companyId,
    'accountingCategories',
    categoryId,
  )
  await deleteDoc(docRef)
}
