import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import admin from 'firebase-admin'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

// Initialize with service account
if (!admin.apps.length) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(
      readFileSync(resolve(serviceAccountPath), 'utf-8'),
    )
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
      storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
    })
  } else {
    // Fallback to default (for production/Cloud Functions)
    const projectId = process.env.FIREBASE_PROJECT_ID || 'useless-dave'
    admin.initializeApp({
      projectId,
      storageBucket: `${projectId}.firebasestorage.app`,
    })
  }
}

export const db: Firestore = admin.firestore()
export const storage: Storage = admin.storage()
