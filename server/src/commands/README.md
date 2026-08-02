# Server Commands Architecture

All Firestore operations happen on the server for security and proper business logic enforcement.

## Structure

```
server/src/commands/
  <domain>/                    # e.g., accounting-categories
    types.ts                   # TypeScript interfaces
    service.ts                 # Business logic + Firestore operations
    routes.ts                  # Express routes/endpoints
```

## Adding a New Command

### 1. Create the folder and types

```bash
mkdir -p server/src/commands/<domain>
```

```typescript
// types.ts - Re-export from shared package
export type {
  MyEntity,
  CreateMyEntityInput,
} from '@useless-dave/shared'
```

**Note**: Define new types in `shared/types/` first, then re-export here.

### 2. Create the service class

```typescript
// service.ts
import type { Firestore } from 'firebase-admin/firestore'
import type { MyEntity, CreateInput } from './types'

export class MyEntityService {
  constructor(
    private db: Firestore,
    private companyId: string,
  ) {}

  private get collection() {
    return this.db.collection(`companies/${this.companyId}/myEntities`)
  }

  async getAll(): Promise<MyEntity[]> {
    const snapshot = await this.collection.get()
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as MyEntity[]
  }

  async create(data: CreateInput): Promise<MyEntity> {
    const docRef = await this.collection.add({
      name: data.name,
      createdAt: new Date(),
    })
    const doc = await docRef.get()
    return {
      id: docRef.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
    } as MyEntity
  }

  // Add more methods...
}
```

### 3. Create REST routes

```typescript
// routes.ts
import type { Request, Response, Router } from 'express'
import type { Firestore } from 'firebase-admin/firestore'
import { MyEntityService } from './service'

export function registerMyEntityRoutes(router: Router, db: Firestore) {
  router.get(
    '/companies/:companyId/my-entities',
    async (req: Request, res: Response) => {
      try {
        const service = new MyEntityService(db, req.params.companyId)
        const entities = await service.getAll()
        res.json(entities)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )

  router.post(
    '/companies/:companyId/my-entities',
    async (req: Request, res: Response) => {
      try {
        const service = new MyEntityService(db, req.params.companyId)
        const entity = await service.create(req.body)
        res.status(201).json(entity)
      } catch (error) {
        res.status(500).json({ error: String(error) })
      }
    },
  )
}
```

### 4. Register in dev-server.ts

```typescript
import { registerMyEntityRoutes } from './commands/my-entities/routes.js'

// In dev-server.ts:
registerMyEntityRoutes(router, db)
```

## Client-Side Integration

The client makes HTTP requests to these endpoints:

```typescript
// client/src/commands/my-domain/shared/service.ts
import { apiRequest } from './api'
import type { MyEntity } from './types'

export async function getMyEntities(companyId: string): Promise<MyEntity[]> {
  return apiRequest<MyEntity[]>(`/companies/${companyId}/my-entities`)
}

export async function createMyEntity(
  companyId: string,
  data: CreateInput,
): Promise<MyEntity> {
  return apiRequest<MyEntity>(`/companies/${companyId}/my-entities`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

## Security Benefits

✅ **No direct Firestore access from client** - All operations go through server
✅ **Server-side validation** - Enforce business rules before writing to DB
✅ **Audit logging** - Track all operations on the server
✅ **Rate limiting** - Can add rate limits to endpoints
✅ **Authentication** - Verify user permissions on every request
✅ **Consistent error handling** - Centralized error responses

## Example: Accounting Categories

See `server/src/commands/accounting-categories/` for a complete CRUD example with:
- **GET** `/companies/:id/accounting-categories` - List all
- **POST** `/companies/:id/accounting-categories` - Create
- **PATCH** `/companies/:id/accounting-categories/:id` - Update
- **DELETE** `/companies/:id/accounting-categories/:id` - Delete
- **GET** `/companies/:id/accounting-categories/search/:query` - Search
