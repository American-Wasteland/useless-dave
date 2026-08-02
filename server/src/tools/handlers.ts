import type { Firestore } from 'firebase-admin/firestore'

export interface ToolContext {
  db: Firestore
  companyId: string
  userId: string
}

interface SearchResult {
  id: string
  name: string
  [key: string]: unknown
}

async function searchByName(
  db: Firestore,
  collectionPath: string,
  query: string,
): Promise<SearchResult[]> {
  const snapshot = await db.collection(collectionPath).get()
  const queryLower = query.toLowerCase()
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as SearchResult)
    .filter((item) => item.name?.toLowerCase().includes(queryLower))
}

export async function searchProviders(
  ctx: ToolContext,
  input: { query: string },
): Promise<string> {
  const results = await searchByName(
    ctx.db,
    `companies/${ctx.companyId}/providers`,
    input.query,
  )
  if (results.length === 0)
    return `No encontré proveedores con "${input.query}". ¿Quieres crear uno nuevo?`
  const list = results
    .slice(0, 5)
    .map((p) => `- ${p.name} (ID: ${p.id})`)
    .join('\n')
  return `Encontré ${results.length} proveedor(es):\n${list}`
}

export async function searchCostCenters(
  ctx: ToolContext,
  input: { query: string },
): Promise<string> {
  const results = await searchByName(
    ctx.db,
    `companies/${ctx.companyId}/costCenters`,
    input.query,
  )
  if (results.length === 0)
    return `No encontré centros de costo con "${input.query}". ¿Quieres crear uno nuevo?`
  const list = results
    .slice(0, 5)
    .map((c) => `- ${c.name} (ID: ${c.id})`)
    .join('\n')
  return `Encontré ${results.length} centro(s) de costo:\n${list}`
}

export async function searchPaymentAccounts(
  ctx: ToolContext,
  input: { query: string },
): Promise<string> {
  const results = await searchByName(
    ctx.db,
    `companies/${ctx.companyId}/paymentAccounts`,
    input.query,
  )
  if (results.length === 0)
    return `No encontré cuentas de pago con "${input.query}".`
  const list = results
    .slice(0, 5)
    .map((a) => `- ${a.name} (ID: ${a.id})`)
    .join('\n')
  return `Encontré ${results.length} cuenta(s) de pago:\n${list}`
}

export async function createProvider(
  ctx: ToolContext,
  input: {
    name: string
    rut: string
    address?: string
    phone?: string
    email?: string
  },
): Promise<string> {
  const docRef = await ctx.db
    .collection(`companies/${ctx.companyId}/providers`)
    .add({
      name: input.name,
      rut: input.rut,
      address: input.address || null,
      phone: input.phone || null,
      email: input.email || null,
      createdAt: new Date(),
    })
  return `Proveedor creado:\n- Nombre: ${input.name}\n- RUT: ${input.rut}\n- ID: ${docRef.id}`
}

export async function createCostCenter(
  ctx: ToolContext,
  input: { name: string; description?: string },
): Promise<string> {
  const docRef = await ctx.db
    .collection(`companies/${ctx.companyId}/costCenters`)
    .add({
      name: input.name,
      description: input.description || null,
    })
  return `Centro de costo creado:\n- Nombre: ${input.name}\n- ID: ${docRef.id}`
}

export async function createExpense(
  ctx: ToolContext,
  input: {
    providerId: string
    costCenterId: string
    totalAmount: number
    description: string
    taxDeductions?: number
    date?: string
    invoiceUrl?: string
  },
): Promise<string> {
  const docRef = await ctx.db
    .collection(`companies/${ctx.companyId}/expenses`)
    .add({
      providerId: input.providerId,
      costCenterId: input.costCenterId,
      totalAmount: input.totalAmount,
      taxDeductions: input.taxDeductions || 0,
      description: input.description,
      date: input.date ? new Date(input.date) : new Date(),
      invoiceUrl: input.invoiceUrl || null,
      status: 'pending',
      createdBy: ctx.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  const [providerDoc, costCenterDoc] = await Promise.all([
    ctx.db
      .doc(`companies/${ctx.companyId}/providers/${input.providerId}`)
      .get(),
    ctx.db
      .doc(`companies/${ctx.companyId}/costCenters/${input.costCenterId}`)
      .get(),
  ])

  const providerName = providerDoc.data()?.name || 'Desconocido'
  const costCenterName = costCenterDoc.data()?.name || 'Desconocido'
  const amount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(input.totalAmount)

  return `Gasto registrado:\n- Proveedor: ${providerName}\n- Centro de costo: ${costCenterName}\n- Monto: ${amount}\n- Descripción: ${input.description}\n- Estado: Pendiente\n- ID: ${docRef.id}`
}

export async function recordPayment(
  ctx: ToolContext,
  input: {
    expenseId: string
    paymentAccountId: string
    amount?: number
    date?: string
    notes?: string
    voucherUrl?: string
  },
): Promise<string> {
  const expenseDoc = await ctx.db
    .doc(`companies/${ctx.companyId}/expenses/${input.expenseId}`)
    .get()
  if (!expenseDoc.exists)
    return `Error: No encontré el gasto con ID ${input.expenseId}`

  const expense = expenseDoc.data()
  const paymentAmount = input.amount || expense?.totalAmount || 0

  await ctx.db
    .collection(
      `companies/${ctx.companyId}/expenses/${input.expenseId}/payments`,
    )
    .add({
      amount: paymentAmount,
      paymentAccountId: input.paymentAccountId,
      date: input.date ? new Date(input.date) : new Date(),
      notes: input.notes || null,
      voucherUrl: input.voucherUrl || null,
      createdAt: new Date(),
    })

  const accountDoc = await ctx.db
    .doc(`companies/${ctx.companyId}/paymentAccounts/${input.paymentAccountId}`)
    .get()
  const accountName = accountDoc.data()?.name || 'Desconocida'
  const amount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(paymentAmount)

  return `Pago registrado:\n- Monto: ${amount}\n- Cuenta: ${accountName}`
}

export async function getRecentExpenses(
  ctx: ToolContext,
  input: { limit?: number; status?: string },
): Promise<string> {
  let query = ctx.db
    .collection(`companies/${ctx.companyId}/expenses`)
    .orderBy('createdAt', 'desc')
    .limit(input.limit || 10)
  if (input.status) query = query.where('status', '==', input.status)

  const snapshot = await query.get()
  if (snapshot.empty) return 'No hay gastos registrados.'

  const expenses = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data()
      const providerDoc = await ctx.db
        .doc(`companies/${ctx.companyId}/providers/${data.providerId}`)
        .get()
      const providerName = providerDoc.data()?.name || 'Desconocido'
      const amount = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(data.totalAmount)
      const statusMap: Record<string, string> = {
        pending: '⏳',
        partial: '🔄',
        paid: '✅',
      }
      return `- ${data.description} | ${providerName} | ${amount} | ${statusMap[data.status] || data.status} (ID: ${doc.id})`
    }),
  )

  return `Gastos recientes:\n${expenses.join('\n')}`
}

export async function executeTool(
  ctx: ToolContext,
  toolName: string,
  input: Record<string, unknown>,
): Promise<string> {
  switch (toolName) {
    case 'search_providers':
      return searchProviders(ctx, input as { query: string })
    case 'search_cost_centers':
      return searchCostCenters(ctx, input as { query: string })
    case 'search_payment_accounts':
      return searchPaymentAccounts(ctx, input as { query: string })
    case 'create_provider':
      return createProvider(ctx, input as { name: string; rut: string })
    case 'create_cost_center':
      return createCostCenter(ctx, input as { name: string })
    case 'create_expense':
      return createExpense(
        ctx,
        input as {
          providerId: string
          costCenterId: string
          totalAmount: number
          description: string
          taxDeductions?: number
          date?: string
          invoiceUrl?: string
        },
      )
    case 'record_payment':
      return recordPayment(
        ctx,
        input as {
          expenseId: string
          paymentAccountId: string
          amount?: number
          date?: string
          notes?: string
          voucherUrl?: string
        },
      )
    case 'get_recent_expenses':
      return getRecentExpenses(
        ctx,
        input as { limit?: number; status?: string },
      )
    default:
      return `Error: Herramienta desconocida: ${toolName}`
  }
}
