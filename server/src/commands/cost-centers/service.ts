import type {
  CostCenter,
  CreateCostCenterInput,
  UpdateCostCenterInput,
} from '@useless-dave/shared'
import type { Firestore } from 'firebase-admin/firestore'

export class CostCenterService {
  constructor(
    private db: Firestore,
    private companyId: string,
  ) {}

  private get collection() {
    return this.db.collection(`companies/${this.companyId}/costCenters`)
  }

  async getAll(): Promise<CostCenter[]> {
    const snapshot = await this.collection.orderBy('name').get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    })) as CostCenter[]
  }

  async getById(id: string): Promise<CostCenter | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
    } as CostCenter
  }

  async create(data: CreateCostCenterInput): Promise<CostCenter> {
    const docRef = await this.collection.add({
      name: data.name,
      type: data.type,
      createdAt: new Date(),
    })

    const doc = await docRef.get()
    return {
      id: docRef.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    } as CostCenter
  }

  async update(id: string, data: UpdateCostCenterInput): Promise<CostCenter> {
    // Filter out undefined values (Firestore doesn't accept them)
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    await this.collection.doc(id).update(updateData)
    const updated = await this.getById(id)
    if (!updated) throw new Error('Cost center not found after update')
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete()
  }

  async search(query: string): Promise<CostCenter[]> {
    const all = await this.getAll()
    const normalized = query.toLowerCase().trim()

    return all.filter((costCenter) =>
      costCenter.name.toLowerCase().includes(normalized),
    )
  }
}
