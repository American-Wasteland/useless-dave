import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { registerAccountingCategoryRoutes } from './commands/accounting-categories/routes.js'
import { registerBankAccountRoutes } from './commands/bank-accounts/routes.js'
import { registerCompanyRoutes } from './commands/companies/routes.js'
import { registerCostCenterRoutes } from './commands/cost-centers/routes.js'
import { registerExpenseRoutes } from './commands/expenses/routes.js'
import { registerProviderRoutes } from './commands/providers/routes.js'
import { db, storage } from './lib/db.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

const router = express.Router()

// Register command routes
registerAccountingCategoryRoutes(router, db)
registerBankAccountRoutes(router, db, storage)
registerCompanyRoutes(router, db, storage)
registerCostCenterRoutes(router, db)
registerExpenseRoutes(router, db, storage)
registerProviderRoutes(router, db, storage)

app.use('/api', router)

// Multer error handling middleware - MUST be after routes
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      err.name === 'MulterError'
    ) {
      console.error('MulterError:', err)
      return res
        .status(400)
        .json({ error: `File upload error: ${(err as Error).message}` })
    }
    console.error('Unhandled error:', err)
    return res.status(500).json({ error: String(err) })
  },
)

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`)
  console.log('   Available endpoints:')
  console.log('   POST   /api/companies')
  console.log('   GET    /api/companies/:companyId/accounting-categories')
  console.log('   POST   /api/companies/:companyId/accounting-categories')
  console.log('   GET    /api/companies/:companyId/accounting-categories/:id')
  console.log('   PATCH  /api/companies/:companyId/accounting-categories/:id')
  console.log('   DELETE /api/companies/:companyId/accounting-categories/:id')
  console.log(
    '   GET    /api/companies/:companyId/accounting-categories/search/:query',
  )
  console.log('   GET    /api/companies/:companyId/bank-accounts')
  console.log('   POST   /api/companies/:companyId/bank-accounts')
  console.log('   GET    /api/companies/:companyId/bank-accounts/:id')
  console.log('   PATCH  /api/companies/:companyId/bank-accounts/:id')
  console.log('   DELETE /api/companies/:companyId/bank-accounts/:id')
  console.log(
    '   POST   /api/companies/:companyId/bank-accounts/:id/statements',
  )
  console.log(
    '   DELETE /api/companies/:companyId/bank-accounts/:id/statements/:month',
  )
  console.log('   GET    /api/companies/:companyId/bank-accounts/search/:query')
  console.log('   GET    /api/companies/:companyId/cost-centers')
  console.log('   POST   /api/companies/:companyId/cost-centers')
  console.log('   GET    /api/companies/:companyId/cost-centers/:id')
  console.log('   PATCH  /api/companies/:companyId/cost-centers/:id')
  console.log('   DELETE /api/companies/:companyId/cost-centers/:id')
  console.log('   GET    /api/companies/:companyId/cost-centers/search/:query')
  console.log('   GET    /api/companies/:companyId/expenses')
  console.log('   POST   /api/companies/:companyId/expenses')
  console.log('   GET    /api/companies/:companyId/expenses/:id')
  console.log('   PATCH  /api/companies/:companyId/expenses/:id')
  console.log('   DELETE /api/companies/:companyId/expenses/:id')
  console.log('   GET    /api/companies/:companyId/expenses/search/:query')
  console.log('   POST   /api/companies/:companyId/expenses/:id/payments')
  console.log(
    '   DELETE /api/companies/:companyId/expenses/:id/payments/:paymentId',
  )
  console.log('   GET    /api/companies/:companyId/providers')
  console.log('   POST   /api/companies/:companyId/providers')
  console.log('   GET    /api/companies/:companyId/providers/:id')
  console.log('   PATCH  /api/companies/:companyId/providers/:id')
  console.log('   DELETE /api/companies/:companyId/providers/:id')
  console.log('   GET    /api/companies/:companyId/providers/search/:query')
  console.log('   GET    /api/companies/:companyId/providers/nit/:nit')
})
