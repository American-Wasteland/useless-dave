import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import type { Company } from '../../types'

const MAX_LOGO_SIZE = 1024 * 1024 // 1MB
const MAX_LOGO_DIMENSION = 512

function validateLogoFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  if (file.size > MAX_LOGO_SIZE) {
    throw new Error('La imagen no debe superar 1MB')
  }
}

async function resizeImage(file: File, maxDimension: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      let { width, height } = img

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension
          width = maxDimension
        } else {
          width = (width / height) * maxDimension
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to resize image'))
          }
        },
        'image/png',
        0.9,
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export async function uploadCompanyLogo(
  companyId: string,
  file: File,
): Promise<string> {
  validateLogoFile(file)

  const resizedBlob = await resizeImage(file, MAX_LOGO_DIMENSION)
  const logoRef = ref(storage, `logos/companies/${companyId}.png`)

  await uploadBytes(logoRef, resizedBlob, {
    contentType: 'image/png',
  })

  return getDownloadURL(logoRef)
}

export async function createCompany(
  userId: string,
  name: string,
  logoFile?: File,
): Promise<Company> {
  // Generate a new company ID
  const companyRef = doc(collection(db, 'companies'))
  const companyId = companyRef.id

  let logoUrl: string | undefined

  // Upload logo if provided
  if (logoFile) {
    logoUrl = await uploadCompanyLogo(companyId, logoFile)
  }

  // Create the company document
  const companyData = {
    name,
    logoUrl,
    createdAt: serverTimestamp(),
    createdBy: userId,
    settings: { currency: 'COP' as const },
  }

  await setDoc(companyRef, companyData)

  // Create user record in company's users subcollection
  const userRef = doc(db, 'companies', companyId, 'users', userId)
  await setDoc(userRef, {
    email: '', // Will be filled from auth context
    role: 'admin',
    modules: {
      expenses: 'edit',
    },
  })

  // Create membership in user's memberships subcollection
  const membershipRef = doc(db, 'users', userId, 'memberships', companyId)
  await setDoc(membershipRef, {
    companyId,
    role: 'admin',
    joinedAt: serverTimestamp(),
  })

  return {
    id: companyId,
    name,
    logoUrl,
    createdBy: userId,
    createdAt: serverTimestamp(),
    settings: { currency: 'COP' },
  } as unknown as Company
}

export async function getUserCompanies(userId: string): Promise<Company[]> {
  // Get all memberships for this user
  const membershipsRef = collection(db, 'users', userId, 'memberships')
  const membershipsSnap = await getDocs(membershipsRef)

  console.log('Memberships found:', membershipsSnap.size)

  if (membershipsSnap.empty) {
    return []
  }

  // Fetch all company documents
  const companies: Company[] = []

  for (const membershipDoc of membershipsSnap.docs) {
    const companyId = membershipDoc.id // Use doc ID directly
    console.log('Fetching company:', companyId)

    try {
      const companyRef = doc(db, 'companies', companyId)
      const companySnap = await getDoc(companyRef)

      if (companySnap.exists()) {
        companies.push({
          id: companySnap.id,
          ...companySnap.data(),
        } as Company)
      }
    } catch (error) {
      console.error('Error fetching company:', companyId, error)
    }
  }

  return companies
}

export async function getCompany(companyId: string): Promise<Company | null> {
  const companyRef = doc(db, 'companies', companyId)
  const companySnap = await getDoc(companyRef)

  if (!companySnap.exists()) {
    return null
  }

  return {
    id: companySnap.id,
    ...companySnap.data(),
  } as Company
}

export async function isUserMemberOfCompany(
  userId: string,
  companyId: string,
): Promise<boolean> {
  const membershipRef = doc(db, 'users', userId, 'memberships', companyId)
  const membershipSnap = await getDoc(membershipRef)
  return membershipSnap.exists()
}
