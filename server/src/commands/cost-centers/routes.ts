import type { Request, Response, Router } from 'express'
import type { Firestore } from 'firebase-admin/firestore'
import { CostCenterService } from './service.js'

export function registerCostCenterRoutes(router: Router, db: Firestore) {
  // Get all cost centers
  router.get(
    '/companies/:companyId/cost-centers',
    async (req: Request, res: Response) => {
      try {
        const service = new CostCenterService(
          db,
          req.params.companyId as string,
        )
        const costCenters = await service.getAll()
        res.json(costCenters)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Get cost center by ID
  router.get(
    '/companies/:companyId/cost-centers/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new CostCenterService(
          db,
          req.params.companyId as string,
        )
        const costCenter = await service.getById(req.params.id as string)
        if (!costCenter) {
          res.status(404).json({ error: 'Cost center not found' })
          return
        }
        res.json(costCenter)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Create cost center
  router.post(
    '/companies/:companyId/cost-centers',
    async (req: Request, res: Response) => {
      try {
        const { name, type } = req.body

        if (!name || !type) {
          res.status(400).json({ error: 'name and type are required' })
          return
        }

        const service = new CostCenterService(
          db,
          req.params.companyId as string,
        )
        const costCenter = await service.create({ name, type })

        res.status(201).json(costCenter)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Update cost center
  router.patch(
    '/companies/:companyId/cost-centers/:id',
    async (req: Request, res: Response) => {
      try {
        const { name, type } = req.body

        const service = new CostCenterService(
          db,
          req.params.companyId as string,
        )
        const costCenter = await service.update(req.params.id as string, {
          name,
          type,
        })

        res.json(costCenter)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Delete cost center
  router.delete(
    '/companies/:companyId/cost-centers/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new CostCenterService(
          db,
          req.params.companyId as string,
        )
        await service.delete(req.params.id as string)
        res.status(204).send()
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Search cost centers
  router.get(
    '/companies/:companyId/cost-centers/search/:query',
    async (req: Request, res: Response) => {
      try {
        const service = new CostCenterService(
          db,
          req.params.companyId as string,
        )
        const costCenters = await service.search(req.params.query as string)
        res.json(costCenters)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )
}
