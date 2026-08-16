import type {
  AddPaymentInput,
  CreateExpenseInput,
  Expense,
  ExpensePayment,
  PaymentStatus,
  UpdateExpenseInput,
} from '@useless-dave/shared'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

/**
 * Calculate expense total: subtotal + iva
 */
export function calculateExpenseTotal(expense: {
  subtotal: number
  iva: number
}): number {
  return expense.subtotal + expense.iva
}

/**
 * Calculate amount to pay: subtotal + iva - reteFuente - reteIca
 */
export function calculateAmountToPay(expense: {
  subtotal: number
  iva: number
  reteFuente?: number
  reteIca?: number
}): number {
  return (
    expense.subtotal +
    expense.iva -
    (expense.reteFuente ?? 0) -
    (expense.reteIca ?? 0)
  )
}

/**
 * Calculate total paid from payments array
 */
export function calculateTotalPaid(payments: ExpensePayment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0)
}

/**
 * Auto-calculate payment status based on amount to pay and total paid
 */
export function autoCalculatePaymentStatus(
  amountToPay: number,
  totalPaid: number,
): PaymentStatus {
  if (totalPaid === 0) return 'pending'
  if (totalPaid >= amountToPay) return 'paid'
  return 'partial'
}

export class ExpenseService {
  constructor(
    private db: Firestore,
    private storage: Storage,
    private companyId: string,
  ) {}

  private get collection() {
    return this.db.collection(`companies/${this.companyId}/expenses`)
  }

  private paymentsCollection(expenseId: string) {
    return this.collection.doc(expenseId).collection('payments')
  }

  /**
   * Get file extension from mimetype
   */
  private getFileExtension(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    return mimeToExt[mimetype] || 'pdf'
  }

  /**
   * Upload invoice (PDF or image)
   */
  private async uploadInvoice(
    expenseId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const bucket = this.storage.bucket()
    const ext = this.getFileExtension(file.mimetype)
    const fileName = `invoice.${ext}`
    const filePath = `companies/${this.companyId}/expenses/${expenseId}/${fileName}`
    const fileUpload = bucket.file(filePath)

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    })

    await fileUpload.makePublic()
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`
  }

  /**
   * Upload payment proof (PDF or image)
   */
  private async uploadPaymentProof(
    expenseId: string,
    paymentId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const bucket = this.storage.bucket()
    const ext = this.getFileExtension(file.mimetype)
    const fileName = `payment-${paymentId}.${ext}`
    const filePath = `companies/${this.companyId}/expenses/${expenseId}/payments/${fileName}`
    const fileUpload = bucket.file(filePath)

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    })

    await fileUpload.makePublic()
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`
  }

  /**
   * Delete all files in an expense's folder
   */
  private async deleteExpenseFiles(expenseId: string): Promise<void> {
    try {
      const bucket = this.storage.bucket()
      const folderPath = `companies/${this.companyId}/expenses/${expenseId}/`
      const [files] = await bucket.getFiles({ prefix: folderPath })

      await Promise.all(files.map((file) => file.delete()))
    } catch (error) {
      console.error('Error deleting expense files:', error)
    }
  }

  /**
   * List expenses sorted by expenseDate desc, optionally filtered by date range.
   * Both from and to are inclusive YYYY-MM-DD strings.
   */
  async list(options?: {
    from?: string
    to?: string
    search?: string
  }): Promise<Expense[]> {
    let query: FirebaseFirestore.Query = this.collection
    if (options?.from) {
      query = query.where('expenseDate', '>=', options.from)
    }
    if (options?.to) {
      query = query.where('expenseDate', '<=', options.to)
    }
    query = query.orderBy('expenseDate', 'desc')
    const snapshot = await query.get()
    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Expense, 'id'>),
    }))
    if (options?.search) {
      const lower = options.search.toLowerCase()
      return expenses.filter((e) => e.title.toLowerCase().includes(lower))
    }
    return expenses
  }

  /**
   * Get expense by ID with payments
   */
  async getById(id: string): Promise<Expense | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null

    const paymentsSnapshot = await this.paymentsCollection(id)
      .orderBy('date', 'desc')
      .get()

    const payments: ExpensePayment[] = paymentsSnapshot.docs.map(
      (paymentDoc) => ({
        id: paymentDoc.id,
        ...(paymentDoc.data() as Omit<ExpensePayment, 'id'>),
      }),
    )

    return {
      id: doc.id,
      ...(doc.data() as Omit<Expense, 'id' | 'payments'>),
      payments,
    }
  }

  /**
   * Create expense with optional invoice upload and initial payments
   */
  async create(
    input: CreateExpenseInput,
    invoiceFile?: Express.Multer.File,
    paymentsData?: Array<{
      data: AddPaymentInput
      proofFile?: Express.Multer.File
    }>,
  ): Promise<Expense> {
    const docRef = this.collection.doc()
    const now = new Date().toISOString()

    const expense: Omit<Expense, 'id'> = {
      ...input,
      ...(invoiceFile && {
        invoiceUrl: await this.uploadInvoice(docRef.id, invoiceFile),
      }),
      payments: [],
      paymentStatus: input.paymentStatus || 'pending',
      createdAt: now,
    }

    await docRef.set(expense)

    // Add payments if provided
    if (paymentsData && paymentsData.length > 0) {
      for (const { data, proofFile } of paymentsData) {
        const paymentRef = this.paymentsCollection(docRef.id).doc()

        let proofUrl: string | undefined
        if (proofFile) {
          proofUrl = await this.uploadPaymentProof(
            docRef.id,
            paymentRef.id,
            proofFile,
          )
        }

        const payment: Omit<ExpensePayment, 'id'> = {
          bankAccountId: data.bankAccountId,
          amount: data.amount,
          date: data.date,
          ...(data.notes ? { notes: data.notes } : {}),
          ...(proofUrl ? { proofUrl } : {}),
          createdAt: now,
        }

        await paymentRef.set(payment)

        // Update bank account balance (debit)
        await this.updateBankAccountBalance(data.bankAccountId, -data.amount)
      }
    }

    return this.getById(docRef.id) as Promise<Expense>
  }

  /**
   * Update expense (optionally replace invoice, add new payments, delete removed payments)
   */
  async update(
    id: string,
    input: UpdateExpenseInput,
    invoiceFile: Express.Multer.File | undefined,
    newPaymentsData?: Array<{
      data: AddPaymentInput
      proofFile?: Express.Multer.File
    }>,
    deletedPaymentIds?: string[],
  ): Promise<Expense | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null

    const updates: Partial<Expense> = {
      ...input,
      updatedAt: new Date().toISOString(),
    }

    if (invoiceFile) {
      updates.invoiceUrl = await this.uploadInvoice(id, invoiceFile)
    }

    await this.collection.doc(id).update(updates)

    // Delete removed payments (restore bank balance + remove files)
    if (deletedPaymentIds && deletedPaymentIds.length > 0) {
      for (const paymentId of deletedPaymentIds) {
        const paymentDoc = await this.paymentsCollection(id)
          .doc(paymentId)
          .get()
        if (!paymentDoc.exists) continue

        const payment = paymentDoc.data() as ExpensePayment
        await this.updateBankAccountBalance(
          payment.bankAccountId,
          payment.amount,
        )

        if (payment.proofUrl) {
          try {
            const bucket = this.storage.bucket()
            const url = new URL(payment.proofUrl)
            const pathParts = url.pathname.split('/')
            const bucketName = pathParts[1]
            const filePath = pathParts.slice(2).join('/')
            if (bucketName === bucket.name) {
              await bucket.file(filePath).delete()
            }
          } catch (error) {
            console.error('Error deleting payment proof:', error)
          }
        }

        await this.paymentsCollection(id).doc(paymentId).delete()
      }
    }

    // Add new payments
    if (newPaymentsData && newPaymentsData.length > 0) {
      const now = new Date().toISOString()
      for (const { data, proofFile } of newPaymentsData) {
        const paymentRef = this.paymentsCollection(id).doc()

        let proofUrl: string | undefined
        if (proofFile) {
          proofUrl = await this.uploadPaymentProof(id, paymentRef.id, proofFile)
        }

        const payment: Omit<ExpensePayment, 'id'> = {
          bankAccountId: data.bankAccountId,
          amount: data.amount,
          date: data.date,
          ...(data.notes ? { notes: data.notes } : {}),
          ...(proofUrl ? { proofUrl } : {}),
          createdAt: now,
        }

        await paymentRef.set(payment)
        await this.updateBankAccountBalance(data.bankAccountId, -data.amount)
      }
    }

    return this.getById(id)
  }

  /**
   * Delete expense and all files
   */
  async delete(id: string): Promise<void> {
    // Delete payments subcollection
    const paymentsSnapshot = await this.paymentsCollection(id).get()
    await Promise.all(paymentsSnapshot.docs.map((doc) => doc.ref.delete()))

    // Delete files
    await this.deleteExpenseFiles(id)

    // Delete expense document
    await this.collection.doc(id).delete()
  }

  /**
   * Add payment to expense and update bank account balance
   */
  async addPayment(
    expenseId: string,
    input: AddPaymentInput,
    proofFile: Express.Multer.File | undefined,
  ): Promise<Expense | null> {
    const expense = await this.getById(expenseId)
    if (!expense) return null

    const now = new Date().toISOString()
    const paymentRef = this.paymentsCollection(expenseId).doc()

    let proofUrl: string | undefined
    if (proofFile) {
      proofUrl = await this.uploadPaymentProof(
        expenseId,
        paymentRef.id,
        proofFile,
      )
    }

    const payment: Omit<ExpensePayment, 'id'> = {
      bankAccountId: input.bankAccountId,
      amount: input.amount,
      date: input.date,
      ...(input.notes ? { notes: input.notes } : {}),
      ...(proofUrl ? { proofUrl } : {}),
      createdAt: now,
    }

    await paymentRef.set(payment)

    // Update bank account balance (debit)
    await this.updateBankAccountBalance(input.bankAccountId, -input.amount)

    // Auto-update payment status unless manually overridden
    const updatedExpense = await this.getById(expenseId)
    if (updatedExpense && updatedExpense.paymentStatus !== 'paid') {
      const amountToPay = calculateAmountToPay(updatedExpense)
      const totalPaid = calculateTotalPaid(updatedExpense.payments)
      const newStatus = autoCalculatePaymentStatus(amountToPay, totalPaid)

      await this.collection.doc(expenseId).update({
        paymentStatus: newStatus,
        updatedAt: now,
      })
    }

    return this.getById(expenseId)
  }

  /**
   * Delete payment from expense and restore bank account balance
   */
  async deletePayment(
    expenseId: string,
    paymentId: string,
  ): Promise<Expense | null> {
    const paymentDoc = await this.paymentsCollection(expenseId)
      .doc(paymentId)
      .get()
    if (!paymentDoc.exists) return null

    const payment = paymentDoc.data() as ExpensePayment

    // Restore bank account balance (credit)
    await this.updateBankAccountBalance(payment.bankAccountId, payment.amount)

    // Delete payment proof file if exists
    if (payment.proofUrl) {
      try {
        const bucket = this.storage.bucket()
        // Extract file path from URL
        const url = new URL(payment.proofUrl)
        const pathParts = url.pathname.split('/')
        const bucketName = pathParts[1]
        const filePath = pathParts.slice(2).join('/')

        // Only delete if it's from our bucket
        if (bucketName === bucket.name) {
          await bucket.file(filePath).delete()
        }
      } catch (error) {
        console.error('Error deleting payment proof:', error)
      }
    }

    await this.paymentsCollection(expenseId).doc(paymentId).delete()

    // Auto-update payment status
    const expense = await this.getById(expenseId)
    if (expense) {
      const amountToPay = calculateAmountToPay(expense)
      const totalPaid = calculateTotalPaid(expense.payments)
      const newStatus = autoCalculatePaymentStatus(amountToPay, totalPaid)

      await this.collection.doc(expenseId).update({
        paymentStatus: newStatus,
        updatedAt: new Date().toISOString(),
      })
    }

    return this.getById(expenseId)
  }

  /**
   * Update bank account balance atomically
   */
  private async updateBankAccountBalance(
    bankAccountId: string,
    delta: number,
  ): Promise<void> {
    const accountRef = this.db.doc(
      `companies/${this.companyId}/bankAccounts/${bankAccountId}`,
    )
    await this.db.runTransaction(async (transaction) => {
      const accountDoc = await transaction.get(accountRef)
      if (!accountDoc.exists) {
        throw new Error(`Bank account not found: ${bankAccountId}`)
      }
      const currentBalance = accountDoc.data()?.currentBalance ?? 0
      transaction.update(accountRef, {
        currentBalance: currentBalance + delta,
      })
    })
  }

  /**
   * Search expenses by title
   */
  async search(query: string): Promise<Expense[]> {
    const lowerQuery = query.toLowerCase()
    const all = await this.list()

    return all.filter((expense) =>
      expense.title.toLowerCase().includes(lowerQuery),
    )
  }
}
