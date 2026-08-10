import type { Request, Response, Router } from 'express'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'
import multer from 'multer'
import { CompanyService } from './service.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('El archivo debe ser una imagen'))
    }
  },
})

export function registerCompanyRoutes(
  router: Router,
  db: Firestore,
  storage: Storage,
) {
  router.post(
    '/companies',
    upload.single('logo'),
    async (req: Request, res: Response) => {
      try {
        const { name, userId } = req.body || {}

        if (!name || !userId) {
          res.status(400).json({ error: 'name and userId are required' })
          return
        }

        const service = new CompanyService(db, storage)
        const company = await service.create(
          { name, userId },
          req.file ?? undefined,
        )

        res.status(201).json(company)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )
}
