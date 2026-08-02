import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { registerAccountingCategoryRoutes } from './commands/accounting-categories/routes.js'
import { db } from './lib/db.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

const router = express.Router()

// Register command routes
registerAccountingCategoryRoutes(router, db)

app.use('/api', router)

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`)
  console.log('   Available endpoints:')
  console.log('   GET    /api/companies/:companyId/accounting-categories')
  console.log('   POST   /api/companies/:companyId/accounting-categories')
  console.log('   GET    /api/companies/:companyId/accounting-categories/:id')
  console.log('   PATCH  /api/companies/:companyId/accounting-categories/:id')
  console.log('   DELETE /api/companies/:companyId/accounting-categories/:id')
  console.log(
    '   GET    /api/companies/:companyId/accounting-categories/search/:query',
  )
})
