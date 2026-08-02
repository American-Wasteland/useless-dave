import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore'
import { db } from '../lib/db.js'

// Recalculate expense status when a payment is created
export const onPaymentCreated = onDocumentCreated(
  'companies/{companyId}/expenses/{expenseId}/payments/{paymentId}',
  async (event) => {
    const { companyId, expenseId } = event.params

    const expenseRef = db.doc(`companies/${companyId}/expenses/${expenseId}`)
    const paymentsSnapshot = await db
      .collection(`companies/${companyId}/expenses/${expenseId}/payments`)
      .get()

    const totalPaid = paymentsSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data()
      return sum + (data.amount || 0)
    }, 0)

    const expenseDoc = await expenseRef.get()
    if (!expenseDoc.exists) return

    const expense = expenseDoc.data()
    if (!expense) return

    let status: 'pending' | 'partial' | 'paid'
    if (totalPaid >= expense.totalAmount) {
      status = 'paid'
    } else if (totalPaid > 0) {
      status = 'partial'
    } else {
      status = 'pending'
    }

    await expenseRef.update({
      status,
      updatedAt: new Date(),
    })
  },
)

// Optional: Track expense status changes for future audit trail
export const onExpenseUpdated = onDocumentUpdated(
  'companies/{companyId}/expenses/{expenseId}',
  async (event) => {
    const beforeData = event.data?.before.data()
    const afterData = event.data?.after.data()

    if (!beforeData || !afterData) return

    // Status change detected - can be used for audit trail in the future
    if (beforeData.status !== afterData.status) {
      // TODO: Implement audit logging to a separate collection if needed
    }
  },
)
