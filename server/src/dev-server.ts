import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { db } from './lib/db.js'
import {
  createAccountingCategory,
  searchAccountingCategories,
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

// Create accounting category
app.post('/commands/create-accounting-category', async (req, res) => {
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

// Find accounting category
app.post('/commands/find-accounting-category', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`)
  console.log('   Available commands:')
  console.log('   POST /commands/create-accounting-category')
  console.log('   POST /commands/find-accounting-category')
})
