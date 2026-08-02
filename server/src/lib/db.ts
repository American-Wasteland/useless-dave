import * as admin from 'firebase-admin'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

// Initialize with service account or default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'useless-dave',
  })
}

export const db: Firestore = admin.firestore()
export const storage: Storage = admin.storage()
