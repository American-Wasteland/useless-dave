import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { db } from './lib/db.js'
import {
  createAccountingCategory,
  createCostCenter,
  createExpense,
  createProvider,
  getRecentExpenses,
  recordPayment,
  searchAccountingCategories,
  searchCostCenters,
  searchPaymentAccounts,
  searchProviders,
} from './tools/handlers.js'
import type { ToolContext } from './tools/index.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

// Middleware to build tool context
const getContext = (companyId: string): ToolContext => {
  const userId = 'dev-user' // TODO: Get from auth
  return { db, companyId, userId }
}

// Accounting categories
app.post('/commands/buscar-categoria-contable', async (req, res) => {
  try {
    const { companyId, query } = req.body
    if (!companyId || !query) {
      res.status(400).json({ error: 'companyId and query required' })
      return
    }
    const result = await searchAccountingCategories(getContext(companyId), {
      query,
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/commands/crear-categoria-contable', async (req, res) => {
  try {
    const { companyId, name, description } = req.body
    if (!companyId || !name) {
      res.status(400).json({ error: 'companyId and name required' })
      return
    }
    const result = await createAccountingCategory(getContext(companyId), {
      name,
      description,
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Providers
app.post('/commands/buscar-proveedor', async (req, res) => {
  try {
    const { companyId, query } = req.body
    if (!companyId || !query) {
      res.status(400).json({ error: 'companyId and query required' })
      return
    }
    const result = await searchProviders(getContext(companyId), { query })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/commands/crear-proveedor', async (req, res) => {
  try {
    const { companyId, name, rut, address, phone, email } = req.body
    if (!companyId || !name || !rut) {
      res.status(400).json({ error: 'companyId, name, and rut required' })
      return
    }
    const result = await createProvider(getContext(companyId), {
      name,
      rut,
      address,
      phone,
      email,
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Cost centers
app.post('/commands/buscar-centro-costo', async (req, res) => {
  try {
    const { companyId, query } = req.body
    if (!companyId || !query) {
      res.status(400).json({ error: 'companyId and query required' })
      return
    }
    const result = await searchCostCenters(getContext(companyId), { query })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/commands/crear-centro-costo', async (req, res) => {
  try {
    const { companyId, name, description } = req.body
    if (!companyId || !name) {
      res.status(400).json({ error: 'companyId and name required' })
      return
    }
    const result = await createCostCenter(getContext(companyId), {
      name,
      description,
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Payment accounts
app.post('/commands/buscar-cuenta-pago', async (req, res) => {
  try {
    const { companyId, query } = req.body
    if (!companyId || !query) {
      res.status(400).json({ error: 'companyId and query required' })
      return
    }
    const result = await searchPaymentAccounts(getContext(companyId), { query })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

// Expenses
app.post('/commands/crear-gasto', async (req, res) => {
  try {
    const {
      companyId,
      providerId,
      costCenterId,
      totalAmount,
      description,
      taxDeductions,
      date,
      invoiceUrl,
    } = req.body
    if (
      !companyId ||
      !providerId ||
      !costCenterId ||
      !totalAmount ||
      !description
    ) {
      res.status(400).json({
        error:
          'companyId, providerId, costCenterId, totalAmount, and description required',
      })
      return
    }
    const result = await createExpense(getContext(companyId), {
      providerId,
      costCenterId,
      totalAmount,
      description,
      taxDeductions,
      date,
      invoiceUrl,
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/commands/registrar-pago', async (req, res) => {
  try {
    const {
      companyId,
      expenseId,
      paymentAccountId,
      amount,
      date,
      notes,
      voucherUrl,
    } = req.body
    if (!companyId || !expenseId || !paymentAccountId) {
      res
        .status(400)
        .json({ error: 'companyId, expenseId, and paymentAccountId required' })
      return
    }
    const result = await recordPayment(getContext(companyId), {
      expenseId,
      paymentAccountId,
      amount,
      date,
      notes,
      voucherUrl,
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post('/commands/ver-gastos', async (req, res) => {
  try {
    const { companyId, limit, status } = req.body
    if (!companyId) {
      res.status(400).json({ error: 'companyId required' })
      return
    }
    const result = await getRecentExpenses(getContext(companyId), {
      limit,
      status,
    })
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`)
  console.log('   Available commands:')
  console.log('   POST /commands/buscar-categoria-contable')
  console.log('   POST /commands/crear-categoria-contable')
  console.log('   POST /commands/buscar-proveedor')
  console.log('   POST /commands/crear-proveedor')
  console.log('   POST /commands/buscar-centro-costo')
  console.log('   POST /commands/crear-centro-costo')
  console.log('   POST /commands/buscar-cuenta-pago')
  console.log('   POST /commands/crear-gasto')
  console.log('   POST /commands/registrar-pago')
  console.log('   POST /commands/ver-gastos')
})
