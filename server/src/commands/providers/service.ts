import type {
  CreateProviderInput,
  Provider,
  UpdateProviderInput,
} from '@useless-dave/shared'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

export class ProviderService {
  constructor(
    private db: Firestore,
    private storage: Storage,
    private companyId: string,
  ) {}

  private get collection() {
    return this.db.collection(`companies/${this.companyId}/providers`)
  }

  /**
   * Upload a file to provider's docs folder
   */
  private async uploadFile(
    providerId: string,
    file: Express.Multer.File,
    documentType: 'rut' | 'bank-account',
  ): Promise<string> {
    const bucket = this.storage.bucket()
    const fileName = `${documentType}.pdf`
    const filePath = `companies/${this.companyId}/providers/${providerId}/docs/${fileName}`
    const fileUpload = bucket.file(filePath)

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    })

    // Make file publicly readable and get URL
    await fileUpload.makePublic()
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`
  }

  /**
   * Delete all files in a provider's folder
   */
  private async deleteProviderFiles(providerId: string): Promise<void> {
    try {
      const bucket = this.storage.bucket()
      const folderPath = `companies/${this.companyId}/providers/${providerId}/`

      // Delete all files with this prefix (entire provider folder)
      await bucket.deleteFiles({ prefix: folderPath })
    } catch (error) {
      // Log error but don't fail the deletion
      console.error(`Failed to delete files for provider ${providerId}:`, error)
    }
  }

  async getAll(): Promise<Provider[]> {
    const snapshot = await this.collection.orderBy('name').get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    })) as Provider[]
  }

  async getById(id: string): Promise<Provider | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
    } as Provider
  }

  async create(
    data: CreateProviderInput,
    files?: { rut?: Express.Multer.File; bankAccount?: Express.Multer.File },
  ): Promise<Provider> {
    // Check for duplicate NIT
    const existingSnapshot = await this.collection
      .where('nit', '==', data.nit)
      .limit(1)
      .get()

    if (!existingSnapshot.empty) {
      throw new Error(`Ya existe un proveedor con el NIT "${data.nit}"`)
    }

    // Step 1: Create provider document
    const docRef = await this.collection.add({
      name: data.name,
      nit: data.nit,
      providerType: data.providerType,
      contactName: data.contactName || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      rutUrl: null,
      bankAccountUrl: null,
      createdAt: new Date(),
    })

    const providerId = docRef.id

    // Step 2: Upload files if provided
    let rutUrl: string | null = null
    let bankAccountUrl: string | null = null

    if (files?.rut) {
      rutUrl = await this.uploadFile(providerId, files.rut, 'rut')
    }
    if (files?.bankAccount) {
      bankAccountUrl = await this.uploadFile(
        providerId,
        files.bankAccount,
        'bank-account',
      )
    }

    // Step 3: Update provider with file URLs if any were uploaded
    if (rutUrl || bankAccountUrl) {
      const updateData: Record<string, unknown> = {}
      if (rutUrl) updateData.rutUrl = rutUrl
      if (bankAccountUrl) updateData.bankAccountUrl = bankAccountUrl

      await docRef.update(updateData)
    }

    // Step 4: Return the created provider
    const doc = await docRef.get()
    return {
      id: docRef.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    } as Provider
  }

  async update(
    id: string,
    data: UpdateProviderInput,
    files?: { rut?: Express.Multer.File; bankAccount?: Express.Multer.File },
  ): Promise<Provider> {
    // If updating NIT, check for duplicates (excluding current provider)
    if (data.nit) {
      const existingSnapshot = await this.collection
        .where('nit', '==', data.nit)
        .limit(2)
        .get()

      const duplicates = existingSnapshot.docs.filter((doc) => doc.id !== id)
      if (duplicates.length > 0) {
        throw new Error(`Ya existe un proveedor con el NIT "${data.nit}"`)
      }
    }

    // If setting rutUrl or bankAccountUrl to null, delete the file from storage
    const provider = await this.getById(id)
    if (!provider) throw new Error('Provider not found')

    if (data.rutUrl === null && provider.rutUrl) {
      // Delete RUT file from storage
      try {
        const bucket = this.storage.bucket()
        const filePath = `companies/${this.companyId}/providers/${id}/docs/rut.pdf`
        console.log('Attempting to delete RUT file:', filePath)
        const file = bucket.file(filePath)
        const [exists] = await file.exists()
        if (exists) {
          await file.delete()
          console.log('Successfully deleted RUT file')
        } else {
          console.log('RUT file does not exist at path:', filePath)
        }
      } catch (error) {
        console.error('Failed to delete RUT file:', error)
      }
    }

    if (data.bankAccountUrl === null && provider.bankAccountUrl) {
      // Delete bank account file from storage
      try {
        const bucket = this.storage.bucket()
        const filePath = `companies/${this.companyId}/providers/${id}/docs/bank-account.pdf`
        console.log('Attempting to delete bank account file:', filePath)
        const file = bucket.file(filePath)
        const [exists] = await file.exists()
        if (exists) {
          await file.delete()
          console.log('Successfully deleted bank account file')
        } else {
          console.log('Bank account file does not exist at path:', filePath)
        }
      } catch (error) {
        console.error('Failed to delete bank account file:', error)
      }
    }

    // Upload new files if provided
    if (files?.rut) {
      data.rutUrl = await this.uploadFile(id, files.rut, 'rut')
    }
    if (files?.bankAccount) {
      data.bankAccountUrl = await this.uploadFile(
        id,
        files.bankAccount,
        'bank-account',
      )
    }

    // Filter out undefined values (Firestore doesn't accept them)
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    await this.collection.doc(id).update(updateData)
    const updated = await this.getById(id)
    if (!updated) throw new Error('Provider not found after update')
    return updated
  }

  async delete(id: string): Promise<void> {
    // Delete all provider files from storage
    await this.deleteProviderFiles(id)

    // Delete the Firestore document
    await this.collection.doc(id).delete()
  }

  async search(query: string): Promise<Provider[]> {
    const all = await this.getAll()
    const normalized = query.toLowerCase().trim()

    return all.filter(
      (provider) =>
        provider.name.toLowerCase().includes(normalized) ||
        provider.nit.includes(normalized) ||
        provider.email?.toLowerCase().includes(normalized),
    )
  }

  async findByNit(nit: string): Promise<Provider | null> {
    const snapshot = await this.collection
      .where('nit', '==', nit)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
    } as Provider
  }
}
