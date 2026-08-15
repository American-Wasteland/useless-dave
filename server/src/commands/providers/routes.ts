import type { Request, Response, Router } from 'express'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'
import multer from 'multer'
import { ProviderService } from './service.js'

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos PDF'))
    }
  },
})

export function registerProviderRoutes(
  router: Router,
  db: Firestore,
  storage: Storage,
) {
  // Get all providers
  router.get(
    '/companies/:companyId/providers',
    async (req: Request, res: Response) => {
      try {
        const service = new ProviderService(
          db,
          storage,
          req.params.companyId as string,
        )
        const providers = await service.getAll()
        res.json(providers)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Get provider by ID
  router.get(
    '/companies/:companyId/providers/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new ProviderService(
          db,
          storage,
          req.params.companyId as string,
        )
        const provider = await service.getById(req.params.id as string)
        if (!provider) {
          res.status(404).json({ error: 'Provider not found' })
          return
        }
        res.json(provider)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  // Create provider with file uploads
  router.post(
    '/companies/:companyId/providers',
    upload.fields([
      { name: 'rut', maxCount: 1 },
      { name: 'bankAccount', maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
      try {
        const {
          name,
          nit,
          providerType,
          contactName,
          email,
          phone,
          address,
          vatRate,
          reteFuenteRate,
          reteIcaRate,
        } = req.body || {}

        if (!name || !nit || !providerType) {
          res
            .status(400)
            .json({ error: 'name, nit, and providerType are required' })
          return
        }

        const service = new ProviderService(
          db,
          storage,
          req.params.companyId as string,
        )

        // Extract files from multer
        const files = req.files as {
          rut?: Express.Multer.File[]
          bankAccount?: Express.Multer.File[]
        }

        const provider = await service.create(
          {
            name,
            nit,
            providerType,
            contactName,
            email,
            phone,
            address,
            vatRate: vatRate !== undefined ? Number(vatRate) : undefined,
            reteFuenteRate:
              reteFuenteRate !== undefined ? Number(reteFuenteRate) : undefined,
            reteIcaRate:
              reteIcaRate !== undefined ? Number(reteIcaRate) : undefined,
          },
          {
            rut: files?.rut?.[0],
            bankAccount: files?.bankAccount?.[0],
          },
        )

        res.status(201).json(provider)
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

  // Update provider with file uploads
  router.patch(
    '/companies/:companyId/providers/:id',
    upload.fields([
      { name: 'rut', maxCount: 1 },
      { name: 'bankAccount', maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
      try {
        const {
          name,
          nit,
          providerType,
          contactName,
          email,
          phone,
          address,
          rutUrl,
          bankAccountUrl,
          vatRate,
          reteFuenteRate,
          reteIcaRate,
        } = req.body

        const service = new ProviderService(
          db,
          storage,
          req.params.companyId as string,
        )

        // Extract files from multer
        const files = req.files as {
          rut?: Express.Multer.File[]
          bankAccount?: Express.Multer.File[]
        }

        const provider = await service.update(
          req.params.id as string,
          {
            name,
            nit,
            providerType,
            contactName,
            email,
            phone,
            address,
            rutUrl: rutUrl === 'null' ? null : rutUrl,
            bankAccountUrl: bankAccountUrl === 'null' ? null : bankAccountUrl,
            vatRate: vatRate !== undefined ? Number(vatRate) : undefined,
            reteFuenteRate:
              reteFuenteRate !== undefined ? Number(reteFuenteRate) : undefined,
            reteIcaRate:
              reteIcaRate !== undefined ? Number(reteIcaRate) : undefined,
          },
          {
            rut: files?.rut?.[0],
            bankAccount: files?.bankAccount?.[0],
          },
        )

        res.json(provider)
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

  // Delete provider
  router.delete(
    '/companies/:companyId/providers/:id',
    async (req: Request, res: Response) => {
      try {
        const service = new ProviderService(
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

  // Search providers
  router.get(
    '/companies/:companyId/providers/search/:query',
    async (req: Request, res: Response) => {
      try {
        const service = new ProviderService(
          db,
          storage,
          req.params.companyId as string,
        )
        const providers = await service.search(req.params.query as string)
        res.json(providers)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )
}
