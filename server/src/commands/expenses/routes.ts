import type { Request, Response, Router } from 'express'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'
import multer from 'multer'
import { ExpenseService } from './service.js'

// Configure multer to store files in memory (NO fileFilter to avoid "Unexpected field" errors)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 50, // Max 50 files
  },
})

export function registerExpenseRoutes(
  router: Router,
  db: Firestore,
  storage: Storage,
) {
  // List all expenses
  router.get(
    '/companies/:companyId/expenses',
    async (req: Request, res: Response) => {
      try {
        const service = new ExpenseService(
          db,
          storage,
          req.params.companyId as string,
        )
        const expenses = await service.list()
        res.json(expenses)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Get expense by ID (with payments)
  router.get(
    '/companies/:companyId/expenses/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new ExpenseService(
          db,
          storage,
          req.params.companyId as string,
        )
        const expense = await service.getById(req.params.id as string)
        if (!expense) {
          res.status(404).json({ error: 'Expense not found' })
          return
        }
        res.json(expense)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Create expense (with optional invoice upload and initial payments)
  router.post(
    '/companies/:companyId/expenses',
    upload.any(),
    async (req: Request, res: Response) => {
      try {
        const {
          title,
          providerId,
          categoryId,
          costCenterId,
          subtotal,
          iva,
          reteFuente,
          reteIca,
          expenseDate,
          paymentStatus,
          payments,
        } = req.body || {}

        if (
          !title ||
          !providerId ||
          !categoryId ||
          !costCenterId ||
          subtotal === undefined ||
          iva === undefined ||
          !expenseDate
        ) {
          res.status(400).json({ error: 'Missing required fields' })
          return
        }

        const service = new ExpenseService(
          db,
          storage,
          req.params.companyId as string,
        )

        // Get invoice file
        const files = req.files as Express.Multer.File[]
        const invoiceFile = files?.find((f) => f.fieldname === 'invoice')

        // Parse payments data if provided
        let paymentsData:
          | Array<{
              data: {
                bankAccountId: string
                amount: number
                date: string
                notes?: string
              }
              proofFile?: Express.Multer.File
            }>
          | undefined

        if (payments) {
          const paymentsArray = JSON.parse(payments)
          paymentsData = paymentsArray.map(
            (payment: unknown, index: number) => {
              const p = payment as {
                bankAccountId: string
                amount: number
                date: string
                notes?: string
              }
              const proofFile = files?.find(
                (f) => f.fieldname === `payment-proof-${index}`,
              )
              return {
                data: {
                  bankAccountId: p.bankAccountId,
                  amount: Number(p.amount),
                  date: p.date,
                  notes: p.notes || '',
                },
                proofFile,
              }
            },
          )
        }

        const expense = await service.create(
          {
            title,
            providerId,
            categoryId,
            costCenterId,
            subtotal: Number(subtotal),
            iva: Number(iva),
            reteFuente: reteFuente ? Number(reteFuente) : undefined,
            reteIca: reteIca ? Number(reteIca) : undefined,
            expenseDate,
            paymentStatus: paymentStatus || undefined,
          },
          invoiceFile,
          paymentsData,
        )

        res.status(201).json(expense)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Update expense (optionally replace invoice, add/remove payments)
  router.patch(
    '/companies/:companyId/expenses/:id',
    upload.any(),
    async (req: Request, res: Response) => {
      try {
        const service = new ExpenseService(
          db,
          storage,
          req.params.companyId as string,
        )
        const files = req.files as Express.Multer.File[]

        const updates: Record<string, unknown> = {}
        if (req.body.title !== undefined) updates.title = req.body.title
        if (req.body.providerId !== undefined)
          updates.providerId = req.body.providerId
        if (req.body.categoryId !== undefined)
          updates.categoryId = req.body.categoryId
        if (req.body.costCenterId !== undefined)
          updates.costCenterId = req.body.costCenterId
        if (req.body.subtotal !== undefined)
          updates.subtotal = Number(req.body.subtotal)
        if (req.body.iva !== undefined) updates.iva = Number(req.body.iva)
        if (req.body.reteFuente !== undefined)
          updates.reteFuente = Number(req.body.reteFuente)
        if (req.body.reteIca !== undefined)
          updates.reteIca = Number(req.body.reteIca)
        if (req.body.expenseDate !== undefined)
          updates.expenseDate = req.body.expenseDate
        if (req.body.paymentStatus !== undefined)
          updates.paymentStatus = req.body.paymentStatus

        const invoiceFile = files?.find((f) => f.fieldname === 'invoice')

        let newPaymentsData:
          | Array<{
              data: {
                bankAccountId: string
                amount: number
                date: string
                notes?: string
              }
              proofFile?: Express.Multer.File
            }>
          | undefined

        if (req.body.payments) {
          const paymentsArray = JSON.parse(req.body.payments)
          newPaymentsData = paymentsArray.map(
            (payment: unknown, index: number) => {
              const p = payment as {
                bankAccountId: string
                amount: number
                date: string
                notes?: string
              }
              const proofFile = files?.find(
                (f) => f.fieldname === `payment-proof-${index}`,
              )
              return {
                data: {
                  bankAccountId: p.bankAccountId,
                  amount: Number(p.amount),
                  date: p.date,
                  ...(p.notes ? { notes: p.notes } : {}),
                },
                proofFile,
              }
            },
          )
        }

        let deletedPaymentIds: string[] | undefined
        if (req.body.deletedPaymentIds) {
          deletedPaymentIds = JSON.parse(req.body.deletedPaymentIds)
        }

        const expense = await service.update(
          req.params.id as string,
          updates,
          invoiceFile,
          newPaymentsData,
          deletedPaymentIds,
        )

        if (!expense) {
          res.status(404).json({ error: 'Expense not found' })
          return
        }

        res.json(expense)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Delete expense
  router.delete(
    '/companies/:companyId/expenses/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new ExpenseService(
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

  // Search expenses
  router.get(
    '/companies/:companyId/expenses/search/:query',
    async (req: Request, res: Response) => {
      try {
        const service = new ExpenseService(
          db,
          storage,
          req.params.companyId as string,
        )
        const expenses = await service.search(req.params.query as string)
        res.json(expenses)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Add payment to expense
  router.post(
    '/companies/:companyId/expenses/:id/payments',
    upload.single('proof'),
    async (req: Request, res: Response) => {
      try {
        const { bankAccountId, amount, date, notes } = req.body || {}

        if (!bankAccountId || amount === undefined || !date) {
          res.status(400).json({ error: 'Missing required fields' })
          return
        }

        const service = new ExpenseService(
          db,
          storage,
          req.params.companyId as string,
        )

        const expense = await service.addPayment(
          req.params.id as string,
          {
            bankAccountId,
            amount: Number(amount),
            date,
            ...(notes ? { notes } : {}),
          },
          req.file,
        )

        if (!expense) {
          res.status(404).json({ error: 'Expense not found' })
          return
        }

        res.json(expense)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Delete payment from expense
  router.delete(
    '/companies/:companyId/expenses/:id/payments/:paymentId',
    async (req: Request, res: Response) => {
      try {
        const service = new ExpenseService(
          db,
          storage,
          req.params.companyId as string,
        )

        const expense = await service.deletePayment(
          req.params.id as string,
          req.params.paymentId as string,
        )

        if (!expense) {
          res.status(404).json({ error: 'Expense or payment not found' })
          return
        }

        res.json(expense)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )
}
