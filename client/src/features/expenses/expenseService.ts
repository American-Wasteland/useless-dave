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
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import type {
  Expense,
  ExpenseFormData,
  Payment,
  PaymentFormData,
} from '../../types'

const getExpensesCollection = (companyId: string) =>
  collection(db, 'companies', companyId, 'expenses')

const getPaymentsCollection = (companyId: string, expenseId: string) =>
  collection(db, 'companies', companyId, 'expenses', expenseId, 'payments')

export async function getExpenses(companyId: string): Promise<Expense[]> {
  const q = query(getExpensesCollection(companyId), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Expense)
}

export async function getExpense(
  companyId: string,
  expenseId: string,
): Promise<Expense | null> {
  const docRef = doc(db, 'companies', companyId, 'expenses', expenseId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as Expense
}

export async function createExpense(
  companyId: string,
  userId: string,
  data: ExpenseFormData,
): Promise<DocumentReference> {
  let invoiceUrl: string | undefined

  if (data.invoiceFile) {
    const fileRef = ref(
      storage,
      `companies/${companyId}/invoices/${Date.now()}_${data.invoiceFile.name}`,
    )
    await uploadBytes(fileRef, data.invoiceFile)
    invoiceUrl = await getDownloadURL(fileRef)
  }

  const expense = {
    providerId: data.providerId,
    totalAmount: data.totalAmount,
    taxDeductions: data.taxDeductions,
    costCenterId: data.costCenterId,
    date: Timestamp.fromDate(new Date(data.date)),
    description: data.description,
    status: 'pending',
    invoiceUrl,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  return addDoc(getExpensesCollection(companyId), expense)
}

export async function updateExpense(
  companyId: string,
  expenseId: string,
  data: Partial<ExpenseFormData>,
): Promise<void> {
  const docRef = doc(db, 'companies', companyId, 'expenses', expenseId)

  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (data.providerId !== undefined) updateData.providerId = data.providerId
  if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount
  if (data.taxDeductions !== undefined)
    updateData.taxDeductions = data.taxDeductions
  if (data.costCenterId !== undefined)
    updateData.costCenterId = data.costCenterId
  if (data.date !== undefined)
    updateData.date = Timestamp.fromDate(new Date(data.date))
  if (data.description !== undefined) updateData.description = data.description

  if (data.invoiceFile) {
    const fileRef = ref(
      storage,
      `companies/${companyId}/invoices/${Date.now()}_${data.invoiceFile.name}`,
    )
    await uploadBytes(fileRef, data.invoiceFile)
    updateData.invoiceUrl = await getDownloadURL(fileRef)
  }

  await updateDoc(docRef, updateData)
}

export async function deleteExpense(
  companyId: string,
  expenseId: string,
): Promise<void> {
  const docRef = doc(db, 'companies', companyId, 'expenses', expenseId)
  await deleteDoc(docRef)
}

// Payments
export async function getPayments(
  companyId: string,
  expenseId: string,
): Promise<Payment[]> {
  const q = query(
    getPaymentsCollection(companyId, expenseId),
    orderBy('date', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, expenseId, ...doc.data() }) as Payment,
  )
}

export async function createPayment(
  companyId: string,
  expenseId: string,
  data: PaymentFormData,
): Promise<DocumentReference> {
  let voucherUrl: string | undefined

  if (data.voucherFile) {
    const fileRef = ref(
      storage,
      `companies/${companyId}/vouchers/${Date.now()}_${data.voucherFile.name}`,
    )
    await uploadBytes(fileRef, data.voucherFile)
    voucherUrl = await getDownloadURL(fileRef)
  }

  const payment = {
    amount: data.amount,
    paymentAccountId: data.paymentAccountId,
    date: Timestamp.fromDate(new Date(data.date)),
    notes: data.notes || null,
    voucherUrl,
    createdAt: serverTimestamp(),
  }

  const paymentRef = await addDoc(
    getPaymentsCollection(companyId, expenseId),
    payment,
  )

  // Update expense status based on total payments
  await updateExpenseStatus(companyId, expenseId)

  return paymentRef
}

async function updateExpenseStatus(
  companyId: string,
  expenseId: string,
): Promise<void> {
  const expense = await getExpense(companyId, expenseId)
  if (!expense) return

  const payments = await getPayments(companyId, expenseId)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  let status: 'pending' | 'partial' | 'paid'
  if (totalPaid >= expense.totalAmount) {
    status = 'paid'
  } else if (totalPaid > 0) {
    status = 'partial'
  } else {
    status = 'pending'
  }

  const expenseRef = doc(db, 'companies', companyId, 'expenses', expenseId)
  await updateDoc(expenseRef, { status, updatedAt: serverTimestamp() })
}
