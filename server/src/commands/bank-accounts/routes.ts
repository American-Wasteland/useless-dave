import type { Request, Response, Router } from 'express'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'
import multer from 'multer'
import { BankAccountService } from './service.js'

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for bank statements
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos PDF'))
    }
  },
})

export function registerBankAccountRoutes(
  router: Router,
  db: Firestore,
  storage: Storage,
) {
  // Get all bank accounts
  router.get(
    '/companies/:companyId/bank-accounts',
    async (req: Request, res: Response) => {
      try {
        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )
        const accounts = await service.getAll()
        res.json(accounts)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Get bank account by ID
  router.get(
    '/companies/:companyId/bank-accounts/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )
        const account = await service.getById(req.params.id as string)
        if (!account) {
          res.status(404).json({ error: 'Bank account not found' })
          return
        }
        res.json(account)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Create bank account
  router.post(
    '/companies/:companyId/bank-accounts',
    async (req: Request, res: Response) => {
      try {
        const { name, initialBalance } = req.body || {}

        if (!name) {
          res.status(400).json({ error: 'Name is required' })
          return
        }

        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )

        const account = await service.create({
          name,
          initialBalance: Number(initialBalance ?? 0),
        })
        res.status(201).json(account)
      } catch (error) {
        res.status(400).json({ error: String(error) })
      }
    },
  )

  // Get movements for a bank account
  router.get(
    '/companies/:companyId/bank-accounts/:id/movements',
    async (req: Request, res: Response) => {
      try {
        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )
        const movements = await service.getMovements(req.params.id as string)
        res.json(movements)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Update bank account
  router.patch(
    '/companies/:companyId/bank-accounts/:id',
    async (req: Request, res: Response) => {
      try {
        const { name } = req.body || {}

        if (!name) {
          res.status(400).json({ error: 'Name is required' })
          return
        }

        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )

        const account = await service.update(req.params.id as string, { name })
        res.json(account)
      } catch (error) {
        res.status(400).json({ error: String(error) })
      }
    },
  )

  // Delete bank account
  router.delete(
    '/companies/:companyId/bank-accounts/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )
        await service.delete(req.params.id as string)
        res.status(204).send()
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Upload bank statement
  router.post(
    '/companies/:companyId/bank-accounts/:id/statements',
    upload.single('statement'),
    async (req: Request, res: Response) => {
      try {
        const { month, uploadedBy } = req.body || {}
        const file = req.file

        if (!month || !file || !uploadedBy) {
          res.status(400).json({
            error: 'Month, statement file, and uploadedBy are required',
          })
          return
        }

        // Validate month format (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(month)) {
          res.status(400).json({ error: 'Month must be in YYYY-MM format' })
          return
        }

        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )

        const account = await service.uploadStatementFile(
          req.params.id as string,
          month,
          file,
          uploadedBy,
        )
        res.json(account)
      } catch (error) {
        res.status(400).json({ error: String(error) })
      }
    },
  )

  // Delete bank statement
  router.delete(
    '/companies/:companyId/bank-accounts/:id/statements/:month',
    async (req: Request, res: Response) => {
      try {
        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )

        const account = await service.deleteStatementFile(
          req.params.id as string,
          req.params.month as string,
        )
        res.json(account)
      } catch (error) {
        res.status(400).json({ error: String(error) })
      }
    },
  )

  // Search bank accounts
  router.get(
    '/companies/:companyId/bank-accounts/search/:query',
    async (req: Request, res: Response) => {
      try {
        const service = new BankAccountService(
          db,
          storage,
          req.params.companyId as string,
        )
        const accounts = await service.search(req.params.query as string)
        res.json(accounts)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )
}
