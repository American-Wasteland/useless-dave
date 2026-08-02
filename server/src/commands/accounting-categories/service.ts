import type {
  AccountingCategory,
  CreateAccountingCategoryInput,
  UpdateAccountingCategoryInput,
} from '@useless-dave/shared'
import type { Firestore } from 'firebase-admin/firestore'

export class AccountingCategoryService {
  constructor(
    private db: Firestore,
    private companyId: string,
  ) {}

  private get collection() {
    return this.db.collection(
      `companies/${this.companyId}/accountingCategories`,
    )
  }

  async getAll(): Promise<AccountingCategory[]> {
    const snapshot = await this.collection.orderBy('name').get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    })) as AccountingCategory[]
  }

  async getById(id: string): Promise<AccountingCategory | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
    } as AccountingCategory
  }

  async create(
    data: CreateAccountingCategoryInput,
  ): Promise<AccountingCategory> {
    // Check for duplicate name
    const existingSnapshot = await this.collection
      .where('name', '==', data.name)
      .limit(1)
      .get()

    if (!existingSnapshot.empty) {
      throw new Error(`Ya existe una categoría con el nombre "${data.name}"`)
    }

    const docRef = await this.collection.add({
      name: data.name,
      description: data.description || null,
      isActive: true,
      createdAt: new Date(),
    })
    const doc = await docRef.get()
    return {
      id: docRef.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    } as AccountingCategory
  }

  async update(
    id: string,
    data: UpdateAccountingCategoryInput,
  ): Promise<AccountingCategory> {
    // If updating name, check for duplicates (excluding current category)
    if (data.name) {
      const existingSnapshot = await this.collection
        .where('name', '==', data.name)
        .limit(2)
        .get()

      const duplicates = existingSnapshot.docs.filter((doc) => doc.id !== id)
      if (duplicates.length > 0) {
        throw new Error(`Ya existe una categoría con el nombre "${data.name}"`)
      }
    }

    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date(),
    })
    const updated = await this.getById(id)
    if (!updated) throw new Error('Category not found after update')
    return updated
  }

  async delete(id: string): Promise<void> {
    // Check if category is used in expenses
    const expensesSnapshot = await this.db
      .collection(`companies/${this.companyId}/expenses`)
      .where('categoryId', '==', id)
      .limit(1)
      .get()

    if (!expensesSnapshot.empty) {
      throw new Error('Cannot delete category with associated expenses')
    }

    await this.collection.doc(id).delete()
  }

  async search(query: string): Promise<AccountingCategory[]> {
    const all = await this.getAll()
    const normalized = query.toLowerCase().trim()
    return all.filter(
      (cat) =>
        cat.name.toLowerCase().includes(normalized) ||
        cat.description?.toLowerCase().includes(normalized),
    )
  }
}
