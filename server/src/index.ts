import * as admin from 'firebase-admin'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

admin.initializeApp()

export const db: Firestore = admin.firestore()
export const storage: Storage = admin.storage()

// Export functions
export * from './functions/expenses.js'
export * from './functions/users.js'
