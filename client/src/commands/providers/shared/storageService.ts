import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../../../lib/firebase'

/**
 * Validate and upload a document (PDF) to Firebase Storage
 * @param companyId - Company ID for organizing files
 * @param providerId - Provider ID
 * @param file - PDF file to upload
 * @param documentType - Type of document ('rut' or 'bank-account')
 * @returns Download URL for the uploaded file
 */
async function uploadDocument(
  companyId: string,
  providerId: string,
  file: File,
  documentType: 'rut' | 'bank-account',
): Promise<string> {
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('El archivo debe ser un PDF')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('El archivo no debe superar 5MB')
  }

  // Create storage reference - all docs in one folder for easy deletion
  const fileName = `${documentType}.pdf`
  const storageRef = ref(
    storage,
    `companies/${companyId}/providers/${providerId}/docs/${fileName}`,
  )

  // Upload file (overwrites if exists)
  const snapshot = await uploadBytes(storageRef, file)

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref)

  return downloadURL
}

/**
 * Upload RUT (PDF) document to Firebase Storage
 */
export async function uploadRUT(
  companyId: string,
  providerId: string,
  file: File,
): Promise<string> {
  return uploadDocument(companyId, providerId, file, 'rut')
}

/**
 * Upload bank account document (PDF) to Firebase Storage
 */
export async function uploadBankAccount(
  companyId: string,
  providerId: string,
  file: File,
): Promise<string> {
  return uploadDocument(companyId, providerId, file, 'bank-account')
}
