import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

interface CreateCompanyInput {
  name: string
  userId: string
}

interface CompanyResult {
  id: string
  name: string
  logoUrl?: string
  createdAt: string
  createdBy: string
  settings: { currency: 'COP' }
}

export class CompanyService {
  constructor(
    private db: Firestore,
    private storage: Storage,
  ) {}

  private async uploadLogo(
    companyId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const bucket = this.storage.bucket()
    const filePath = `companies/${companyId}/logo`
    const fileUpload = bucket.file(filePath)

    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    })

    await fileUpload.makePublic()
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`
  }

  async create(
    data: CreateCompanyInput,
    logoFile?: Express.Multer.File,
  ): Promise<CompanyResult> {
    // 1. Create company document to get the generated ID
    const companyRef = this.db.collection('companies').doc()
    const companyId = companyRef.id

    await companyRef.set({
      name: data.name,
      createdAt: new Date(),
      createdBy: data.userId,
      settings: { currency: 'COP' },
    })

    // 2. Upload logo if provided and update the document with the URL
    let logoUrl: string | undefined
    if (logoFile) {
      logoUrl = await this.uploadLogo(companyId, logoFile)
      await companyRef.update({ logoUrl })
    }

    // 3. Create user record in the company's users subcollection
    await this.db.doc(`companies/${companyId}/users/${data.userId}`).set({
      email: '',
      role: 'admin',
      modules: { expenses: 'edit' },
    })

    // 4. Create membership in the user's memberships subcollection
    await this.db.doc(`users/${data.userId}/memberships/${companyId}`).set({
      companyId,
      role: 'admin',
      joinedAt: new Date(),
    })

    return {
      id: companyId,
      name: data.name,
      logoUrl,
      createdAt: new Date().toISOString(),
      createdBy: data.userId,
      settings: { currency: 'COP' },
    }
  }
}
