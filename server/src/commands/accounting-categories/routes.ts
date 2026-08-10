import type { Request, Response, Router } from 'express'
import type { Firestore } from 'firebase-admin/firestore'
import { AccountingCategoryService } from './service.js'

export function registerAccountingCategoryRoutes(
  router: Router,
  db: Firestore,
) {
  // Get all categories
  router.get(
    '/companies/:companyId/accounting-categories',
    async (req: Request, res: Response) => {
      try {
        const service = new AccountingCategoryService(
          db,
          req.params.companyId as string,
        )
        const categories = await service.getAll()
        res.json(categories)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Get category by ID
  router.get(
    '/companies/:companyId/accounting-categories/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new AccountingCategoryService(
          db,
          req.params.companyId as string,
        )
        const category = await service.getById(req.params.id as string)
        if (!category) {
          res.status(404).json({ error: 'Category not found' })
          return
        }
        res.json(category)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Create category
  router.post(
    '/companies/:companyId/accounting-categories',
    async (req: Request, res: Response) => {
      try {
        const { name, description } = req.body
        if (!name) {
          res.status(400).json({ error: 'name is required' })
          return
        }
        const service = new AccountingCategoryService(
          db,
          req.params.companyId as string,
        )
        const category = await service.create({ name, description })
        res.status(201).json(category)
      } catch (error) {
        const errorMessage = String(error)
        if (errorMessage.includes('Ya existe')) {
          res.status(409).json({ error: errorMessage.replace('Error: ', '') })
        } else {
          res.status(500).json({ error: errorMessage })
        }
      }
    },
  )

  // Update category
  router.patch(
    '/companies/:companyId/accounting-categories/:id',
    async (req: Request, res: Response) => {
      try {
        const { name, description } = req.body
        const service = new AccountingCategoryService(
          db,
          req.params.companyId as string,
        )
        const category = await service.update(req.params.id as string, {
          name,
          description,
        })
        res.json(category)
      } catch (error) {
        const errorMessage = String(error)
        if (errorMessage.includes('Ya existe')) {
          res.status(409).json({ error: errorMessage.replace('Error: ', '') })
        } else {
          res.status(500).json({ error: errorMessage })
        }
      }
    },
  )

  // Delete category
  router.delete(
    '/companies/:companyId/accounting-categories/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new AccountingCategoryService(
          db,
          req.params.companyId as string,
        )
        await service.delete(req.params.id as string)
        res.status(204).send()
      } catch (error) {
        if (String(error).includes('Cannot delete')) {
          res.status(409).json({ error: String(error) })
        } else {
          res.status(500).json({ error: String(error) })
        }
      }
    },
  )

  // Search categories
  router.get(
    '/companies/:companyId/accounting-categories/search/:query',
    async (req: Request, res: Response) => {
      try {
        const service = new AccountingCategoryService(
          db,
          req.params.companyId as string,
        )
        const categories = await service.search(req.params.query as string)
        res.json(categories)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )
}
