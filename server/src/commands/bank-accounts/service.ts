import type {
  BankAccount,
  BankMovement,
  BankStatement,
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from '@useless-dave/shared'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

export class BankAccountService {
  constructor(
    private db: Firestore,
    private storage: Storage,
    private companyId: string,
  ) {}

  private get collection() {
    return this.db.collection(`companies/${this.companyId}/bankAccounts`)
  }

  /**
   * Upload a bank statement file
   */
  private async uploadStatement(
    bankAccountId: string,
    month: string,
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<BankStatement> {
    const bucket = this.storage.bucket()
    const fileName = `statement-${month}.pdf`
    const filePath = `companies/${this.companyId}/bank-accounts/${bankAccountId}/statements/${fileName}`
    const fileUpload = bucket.file(filePath)

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    })

    // Make file publicly readable and get URL
    await fileUpload.makePublic()
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`

    return {
      id: `${month}-${Date.now()}`,
      month,
      fileUrl,
      fileName: file.originalname,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    }
  }

  /**
   * Delete a specific statement file
   */
  private async deleteStatement(
    bankAccountId: string,
    month: string,
  ): Promise<void> {
    try {
      const bucket = this.storage.bucket()
      const fileName = `statement-${month}.pdf`
      const filePath = `companies/${this.companyId}/bank-accounts/${bankAccountId}/statements/${fileName}`

      await bucket.file(filePath).delete()
    } catch (error) {
      console.error(`Failed to delete statement for ${month}:`, error)
    }
  }

  /**
   * Delete all files in a bank account's folder
   */
  private async deleteBankAccountFiles(bankAccountId: string): Promise<void> {
    try {
      const bucket = this.storage.bucket()
      const folderPath = `companies/${this.companyId}/bank-accounts/${bankAccountId}/`

      await bucket.deleteFiles({ prefix: folderPath })
    } catch (error) {
      console.error(
        `Failed to delete files for bank account ${bankAccountId}:`,
        error,
      )
    }
  }

  async getAll(): Promise<BankAccount[]> {
    const snapshot = await this.collection.orderBy('name').get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    })) as BankAccount[]
  }

  async getById(id: string): Promise<BankAccount | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null
    const account = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
    } as BankAccount
    account.statements = [...(account.statements ?? [])].sort((a, b) =>
      b.month.localeCompare(a.month),
    )
    return account
  }

  async getMovements(id: string): Promise<BankMovement[]> {
    const snapshot = await this.collection
      .doc(id)
      .collection('movements')
      .orderBy('date', 'desc')
      .get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    })) as BankMovement[]
  }

  async create(data: CreateBankAccountInput): Promise<BankAccount> {
    const docRef = await this.collection.add({
      name: data.name,
      initialBalance: data.initialBalance,
      currentBalance: data.initialBalance,
      statements: [],
      createdAt: new Date(),
    })

    const doc = await docRef.get()
    return {
      id: docRef.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    } as BankAccount
  }

  async update(id: string, data: UpdateBankAccountInput): Promise<BankAccount> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    await this.collection.doc(id).update(updateData)
    const updated = await this.getById(id)
    if (!updated) throw new Error('Bank account not found after update')
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.deleteBankAccountFiles(id)
    await this.collection.doc(id).delete()
  }

  async uploadStatementFile(
    id: string,
    month: string,
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<BankAccount> {
    const bankAccount = await this.getById(id)
    if (!bankAccount) throw new Error('Bank account not found')

    // Check if statement for this month already exists
    const existingIndex = bankAccount.statements.findIndex(
      (s) => s.month === month,
    )

    // Upload the new file
    const newStatement = await this.uploadStatement(id, month, file, uploadedBy)

    // If statement exists, delete old file and replace
    if (existingIndex !== -1) {
      await this.deleteStatement(id, month)
      bankAccount.statements[existingIndex] = newStatement
    } else {
      // Add new statement
      bankAccount.statements.push(newStatement)
    }

    // Sort statements by month ascending
    bankAccount.statements.sort((a, b) => b.month.localeCompare(a.month))

    // Update document
    await this.collection.doc(id).update({
      statements: bankAccount.statements,
      updatedAt: new Date(),
    })

    return (await this.getById(id)) as BankAccount
  }

  async deleteStatementFile(id: string, month: string): Promise<BankAccount> {
    const bankAccount = await this.getById(id)
    if (!bankAccount) throw new Error('Bank account not found')

    const statementIndex = bankAccount.statements.findIndex(
      (s) => s.month === month,
    )

    if (statementIndex === -1) {
      throw new Error('Statement not found')
    }

    // Delete file from storage
    await this.deleteStatement(id, month)

    // Remove from array
    bankAccount.statements.splice(statementIndex, 1)

    // Update document
    await this.collection.doc(id).update({
      statements: bankAccount.statements,
      updatedAt: new Date(),
    })

    return (await this.getById(id)) as BankAccount
  }

  async search(query: string): Promise<BankAccount[]> {
    const all = await this.getAll()
    const normalized = query.toLowerCase().trim()

    return all.filter((account) =>
      account.name.toLowerCase().includes(normalized),
    )
  }
}
