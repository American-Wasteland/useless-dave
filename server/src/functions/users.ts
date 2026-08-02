import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { db } from '../index.js'

interface InviteUserData {
  companyId: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  modules: {
    expenses?: 'edit' | 'view'
  }
}

// Invite a user to a company (admin only)
export const inviteUser = onCall<InviteUserData>(async (request) => {
  const { auth, data } = request

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { companyId, email, role, modules } = data

  // Check if caller is admin
  const callerDoc = await db
    .doc(`companies/${companyId}/users/${auth.uid}`)
    .get()

  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can invite users')
  }

  // For now, just create a pending invitation
  // In a real app, you'd send an email and handle the invitation flow
  await db.collection(`companies/${companyId}/invitations`).add({
    email,
    role,
    modules,
    invitedBy: auth.uid,
    createdAt: new Date(),
    status: 'pending',
  })

  return { success: true }
})

// Get current user's company data
export const getUserCompany = onCall(async (request) => {
  const { auth } = request

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  // For now, return the default company
  // In a full implementation, you'd query for the user's company membership
  const companyId = 'default-company'

  const [companyDoc, userDoc] = await Promise.all([
    db.doc(`companies/${companyId}`).get(),
    db.doc(`companies/${companyId}/users/${auth.uid}`).get(),
  ])

  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found in any company')
  }

  return {
    company: companyDoc.exists
      ? { id: companyDoc.id, ...companyDoc.data() }
      : null,
    user: { id: userDoc.id, ...userDoc.data() },
  }
})
