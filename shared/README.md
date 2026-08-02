# Shared Types Package

Single source of truth for all TypeScript types used across client and server.

## Structure

```
shared/
  types/
    common.ts                 # Base types (Entity, etc.)
    accounting-categories.ts  # Domain-specific types
    index.ts                  # Main export
  dist/                       # Compiled output (git-ignored)
  package.json                # @useless-dave/shared
```

## Usage

Both client and server import from `@useless-dave/shared`:

```typescript
import type {
  AccountingCategory,
  CreateAccountingCategoryInput,
} from '@useless-dave/shared'
```

## Adding New Types

1. Create or update a file in `types/`:
```typescript
// types/my-feature.ts
import type { Entity } from './common.js'

export interface MyEntity extends Entity {
  name: string
  status: string
}

export interface CreateMyEntityInput {
  name: string
}
```

2. Export from `types/index.ts`:
```typescript
export * from './my-feature.js'
```

3. Rebuild:
```bash
npm run build
```

4. Use in client/server:
```typescript
import type { MyEntity } from '@useless-dave/shared'
```

## Conventions

- **DTO types**: Use ISO `string` for dates (JSON serialization)
- **Entity base**: Extend `Entity` for ID + timestamps
- **Input types**: Suffix with `Input` (e.g., `CreateXInput`)
- **Update types**: Suffix with `Input` (e.g., `UpdateXInput`)
- **File extensions**: Use `.js` in imports (NodeNext resolution)

## Type Conversions

Server converts Firestore `Date` → ISO `string`:

```typescript
// Server service
return {
  id: doc.id,
  ...doc.data(),
  createdAt: doc.data()?.createdAt?.toDate().toISOString(),
}
```

Client receives ISO strings and can display or convert as needed.
