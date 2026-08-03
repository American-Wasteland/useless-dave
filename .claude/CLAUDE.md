# Useless Dave - AI Context

## Project Overview

Useless Dave is a small business ERP with an interactive command system. The name references a punk/skater aesthetic (Tony Hawk American Wasteland vibes) - the UI should feel fun and playful, not corporate.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | React Query (TanStack Query) |
| Linting | Biome (root-level config) |
| Backend | Express REST API + Firebase Functions (Node.js 20) |
| Database | Firestore (server-side only, accessed via REST API) |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage |
| Commands | Interactive command system (Spanish UI, English code) |
| Shared Types | `@useless-dave/shared` package (client + server) |

## Backend Architecture

All data operations go through **server-side REST API endpoints**. The client never accesses Firestore directly.

### API Structure

Each entity has a dedicated service and routes:
- **Service** (`server/src/commands/{entity}/service.ts`) - Business logic and Firestore operations
- **Routes** (`server/src/commands/{entity}/routes.ts`) - Express route handlers
- **Types** (`shared/types/{entity}.ts`) - Shared TypeScript types

### Available Endpoints

**Accounting Categories** (`/api/companies/:companyId/accounting-categories`)
- `GET /` - List all
- `POST /` - Create
- `GET /:id` - Get by ID
- `PATCH /:id` - Update
- `DELETE /:id` - Delete
- `GET /search/:query` - Search

**Cost Centers** (`/api/companies/:companyId/cost-centers`)
- `GET /` - List all
- `POST /` - Create (requires `name`, `type`)
- `GET /:id` - Get by ID
- `PATCH /:id` - Update
- `DELETE /:id` - Delete
- `GET /search/:query` - Search

**Providers** (`/api/companies/:companyId/providers`)
- `GET /` - List all
- `POST /` - Create with file uploads (requires `name`, `nit`, `providerType`)
- `GET /:id` - Get by ID
- `PATCH /:id` - Update with file uploads
- `DELETE /:id` - Delete (also removes uploaded files)
- `GET /search/:query` - Search
- `GET /nit/:nit` - Find by NIT

### Adding a New Entity

1. **Create shared types** in `shared/types/{entity}.ts`:
   ```typescript
   export interface MyEntity extends Entity {
     name: string
     // ... fields
   }
   export interface CreateMyEntityInput { ... }
   export interface UpdateMyEntityInput { ... }
   ```

2. **Export from shared package** in `shared/types/index.ts`

3. **Create service** in `server/src/commands/{entity}/service.ts`

4. **Create routes** in `server/src/commands/{entity}/routes.ts`

5. **Register routes** in `server/src/dev-server.ts`

6. **Client service** (`client/src/commands/{entity}/shared/{entity}Service.ts`) - API client functions

7. **Client hooks** (`client/src/hooks/use{Entity}.ts`) - React Query hooks that use the service

### Client-Side Pattern

Each entity has client-side API integration:

```
client/src/commands/{entity}/shared/
├── api.ts              # Generic apiRequest helper
├── types.ts            # Re-export shared types
└── {entity}Service.ts  # API client functions (getCostCenters, createCostCenter, etc.)
```

Example service function:
```typescript
export async function createCostCenter(
  companyId: string,
  data: CreateCostCenterInput,
): Promise<CostCenter> {
  return apiRequest<CostCenter>(`/companies/${companyId}/cost-centers`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

Hooks use React Query:
```typescript
const createMutation = useMutation({
  mutationFn: async (data: CreateCostCenterInput) => {
    return costCenterService.createCostCenter(companyId!, data)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: costCenterKeys.list(companyId!) })
  },
})
```

## Multi-Company Support

Users can belong to multiple companies. This is a core architectural feature.

### Data Model

```
users/{userId}
  └── memberships/{companyId}    # Links user to companies (role, joinedAt)

companies/{companyId}
  └── users/{userId}             # Company members with roles
```

### Key Components

- **`/users/{userId}/memberships/{companyId}`** - Subcollection linking users to companies
- **`AuthContext`** - Fetches user's companies on login, exposes `companies` and `companiesLoaded`
- **`ProtectedRoute`** - Redirects based on company membership:
  - No companies → `/create-company`
  - Single company → auto-redirect to `/{companyId}`
  - Multiple companies → `/select-company`
- **URL Structure**: All routes are company-scoped: `/:companyId/...`

### Creating a Company

When creating a company, you must create:
1. Company document in `/companies/{id}`
2. User record in `/companies/{id}/users/{userId}` with role 'admin'
3. Membership in `/users/{userId}/memberships/{companyId}`

## Command System

The app uses an **interactive command system** with step-by-step parameter collection.

### User Flow

```
1. User focuses input → "/" automatically added
2. Dropdown opens ABOVE input showing commands
3. User types or selects command (e.g., /crear-categoria-contable)
4. Input prompts: "Nombre de la categoría?"
5. User types answer, presses Enter
6. Input prompts: "Descripción (opcional)?"
7. User types answer (or skips), presses Enter
8. Navigate to /:companyId/categories/create?name=X&description=Y
```

### Architecture

**Centralized Config** - `client/src/features/commands/commandRegistry.ts`:

```typescript
export const COMMANDS: CommandDefinition[] = [
  {
    id: 'create-accounting-category',
    name: '/crear-categoria-contable',  // Spanish for users
    description: 'Crear una nueva categoría contable',
    icon: '📊',
    targetPath: '/categories/create',  // Where to navigate
    parameters: [
      {
        name: 'name',  // English in code
        label: 'Nombre de la categoría',  // Spanish for users
        type: 'text',
        required: true,
        placeholder: 'ej: Insumos médicos',
      },
      // ... more params
    ],
  },
]
```

### Key Files

| File | Purpose |
|------|---------|
| `client/src/features/commands/commandRegistry.ts` | Centralized command definitions |
| `client/src/features/commands/CommandInterface.tsx` | Main UI with welcome screen |
| `client/src/features/commands/components/CommandInput.tsx` | Interactive input with dropdown + param collection |
| `server/src/dev-server.ts` | REST endpoints for commands |

### Available Commands

- `/crear-categoria-contable` - Create accounting category
- `/buscar-categoria-contable` - Find accounting categories
- `/crear-centro-costo` - Create cost center
- `/buscar-centro-costo` - Find cost centers
- `/crear-proveedor` - Create provider
- `/buscar-proveedor` - Find provider

### Adding a New Command

1. **Add to command registry** (`client/src/features/commands/commandRegistry.ts`):
   ```typescript
   {
     id: 'my-command',
     name: '/mi-comando',
     description: 'Descripción del comando',
     icon: '🎯',
     targetPath: '/my-entity?modal=myentity&mode=action',  // Can include query params
     parameters: [
       { name: 'param1', label: 'Parámetro 1', type: 'text', required: true },
     ],
   }
   ```

2. **Create entity page and modal manager** (see Entity Management Pattern above)

That's it! The CommandInput handles the rest:
- If `targetPath` contains query params, they are merged with collected parameters
- Example: `/providers?modal=provider&mode=find` + `{query: "Amer"}` → `/providers?modal=provider&mode=find&query=Amer`

## UI/UX Guidelines

- **Playful, not corporate** - Use the secondary teal color (#527575), fun copy, slight rotations on cards
- **No dark mode** - Light theme only
- **Spanish UI, English code** - All user-facing text in Spanish (Colombian), all code/variables in English
- **Command-driven** - Terminal aesthetic with `/` prefix for all commands
- **Step-by-step guidance** - Input prompts users for each parameter one at a time
- **Dave branding** - Punk character with mohawk emblem (see `/public/dave-emblem.svg`)

## Development

```bash
# Start everything
npm run dev

# Lint (must pass with zero warnings for commits)
npm run lint

# Auto-fix
npm run lint:fix
```

### Lint Rules

Biome is configured at root level. Key disabled rules:
- `noNonNullAssertion`: off (safe with React Query's `enabled` guards)
- `noArrayIndexKey`: off (used for non-reorderable lists)
- `noForEach`: off (allowed for readability)

## Common Patterns

### Reading Command Parameters

Command parameters are passed via URL query string:

```typescript
import { useSearchParams } from 'react-router-dom'

function MyCommandPage() {
  const [searchParams] = useSearchParams()
  const name = searchParams.get('name') || ''
  const description = searchParams.get('description') || ''

  // ... use params
}
```

### Router-Based Panels

All panels are router-based, not state-based:
```typescript
// Navigate to panel
navigate(`/${companyId}/categories/create?name=Insumos`)

// Close panel
navigate(`/${companyId}`)
```

### Modal Management System

**IMPORTANT**: All modals use a centralized query parameter system for consistency and better UX.

#### Query Parameter Format

```
?modal={entity}&mode={action}&id={id}
```

Examples:
- Create: `?modal=provider&mode=create`
- View: `?modal=provider&mode=view&id=123`
- Update: `?modal=provider&mode=update&id=123`

#### Architecture

1. **Global ModalManager** (`client/src/components/modals/ModalManager.tsx`)
   - Placed inside `/:companyId` route in `App.tsx` (needs access to route params)
   - Routes to feature-specific modal managers based on `modal` param

2. **Feature Modal Manager** (e.g., `ProviderModalManager.tsx`)
   - Routes to specific modals based on `mode` param
   - One per entity (providers, categories, etc.)

3. **Individual Modals** (e.g., `ProviderCreateModal.tsx`, `ProviderViewModal.tsx`)
   - Read `id` param if needed
   - Use `SlidePanel` which auto-closes by removing query params

#### Adding a New Modal-Managed Entity

1. **Create feature modal manager**:
   ```typescript
   // client/src/features/myentity/MyEntityModalManager.tsx
   export function MyEntityModalManager() {
     const [searchParams] = useSearchParams()
     const mode = searchParams.get('mode')
     const entityId = searchParams.get('id')

     switch (mode) {
       case 'create':
         return <MyEntityCreateModal />
       case 'view':
         if (!entityId) return null
         return <MyEntityViewModal />
       case 'update':
         if (!entityId) return null
         return <MyEntityUpdateModal />
       default:
         return null
     }
   }
   ```

2. **Register in global ModalManager**:
   ```typescript
   // client/src/components/modals/ModalManager.tsx
   switch (modal) {
     case 'provider':
       return <ProviderModalManager />
     case 'myentity':
       return <MyEntityModalManager />
   ```

3. **Create individual modals** using `SlidePanel`
   - SlidePanel automatically clears ALL query params on close
   - No need for manual `onClose` handlers

#### Entity Management Pattern

**IMPORTANT**: All entity management (CRUD operations) should be centralized on a single dedicated page per entity.

**Pattern**:
- Each entity has one dedicated page (e.g., `/accountancy/providers`)
- All commands for that entity navigate to that page with modal query params
- All CRUD operations (create, find, view, update) happen through modals on that page

**Example: Providers**

Commands in registry:
```typescript
{
  id: 'create-provider',
  name: '/crear-proveedor',
  targetPath: '/accountancy/providers?modal=provider&mode=create',
  parameters: [...]
}

{
  id: 'find-provider',
  name: '/buscar-proveedor',
  targetPath: '/accountancy/providers?modal=provider&mode=find',
  parameters: [{ name: 'query', ... }]
}
```

All these commands navigate to `/accountancy/providers` with different modal states. The `ProviderModalManager` handles routing to the appropriate modal based on query params.

**Benefits**:
- Single source of truth for entity management
- Consistent URLs and deep-linking
- Better browser history management
- Cleaner command definitions

#### Navigation Best Practices

- **CRITICAL**: Use `<Link>` for ALL navigation (not `onClick` with `navigate()`)
- Benefits: Better UX (right-click, copy link, browser history), proper accessibility
- **Back navigation**: Use `navigate(-1)` for back buttons to leverage browser history
- **Exception**: Delete actions can use buttons since they don't navigate (they open confirmation modals)

### UI Standards

#### Modal Titles
- **Sentence case**: Only first word capitalized (Spanish style)
- Examples: "Detalle del proveedor", "Crear proveedor", "Actualizar proveedor"
- Never use title case ("Detalle Del Proveedor") or uppercase ("DETALLE DEL PROVEEDOR")

#### Field Labels
All field labels in modals/forms use consistent styling:

```tsx
<div className="text-xs text-gray-500 font-medium normal-case">
  NIT
</div>
```

The `normal-case` utility is critical to override any inherited text transformations.

#### Table Patterns

**Clickable rows** - Use the "stretched link" pattern to make entire rows clickable:

**Pattern Requirements**:
- Row: `className="hover:bg-gray-50 transition-colors relative"`
- First column link: Add `before:absolute before:inset-0` to stretch over entire row
- Actions column: Add `relative z-10` to keep buttons/links clickable above the stretched link
- View action: First column link navigates to view modal
- Edit action: MUST be a `<Link>`, not a button
- Delete action: Button is OK (doesn't navigate, opens confirmation modal)

**Full example**:
```tsx
<tbody className="bg-white divide-y divide-gray-200">
  {items.map((item) => (
    <tr
      key={item.id}
      className="hover:bg-gray-50 transition-colors relative"
    >
      {/* First column with stretched link */}
      <td className="px-6 py-4">
        <Link
          to={`/${companyId}/entity?modal=entity&mode=view&id=${item.id}`}
          className="text-sm font-medium text-gray-900 before:absolute before:inset-0"
        >
          {item.name}
        </Link>
      </td>

      {/* Other columns */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">
          {item.description}
        </div>
      </td>

      {/* Actions column - z-10 to work above stretched link */}
      <td className="px-6 py-4 relative z-10">
        {/* Edit: Must be Link */}
        <Link
          to={`/${companyId}/entity?modal=entity&mode=update&id=${item.id}`}
          className="inline-flex items-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1"
        >
          <Pencil className="h-4 w-4" />
        </Link>

        {/* Delete: Button OK (no navigation) */}
        <button
          type="button"
          onClick={() => handleDeleteClick(item.id, item.name)}
          className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  ))}
</tbody>
```

#### Action Button Standards

**IMPORTANT**: All action buttons in tables must follow these color standards:

**Edit buttons** - Blue hover:
```tsx
className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
```

**Delete buttons** - Red hover:
```tsx
className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
```

**Delete confirmation** - Always use `ConfirmModal` component:
```tsx
import { ConfirmModal } from '../../../components/ui'

const [deleteConfirm, setDeleteConfirm] = useState<{
  id: string
  name: string
} | null>(null)
const [isDeleting, setIsDeleting] = useState(false)

const handleDeleteClick = (id: string, name: string) => {
  setDeleteConfirm({ id, name })
}

const handleDeleteConfirm = async () => {
  if (!deleteConfirm) return
  setIsDeleting(true)
  try {
    await deleteEntity(deleteConfirm.id)
    setDeleteConfirm(null)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Error al eliminar')
  } finally {
    setIsDeleting(false)
  }
}

// In JSX:
<ConfirmModal
  isOpen={!!deleteConfirm}
  onClose={() => setDeleteConfirm(null)}
  onConfirm={handleDeleteConfirm}
  title="Eliminar entidad"
  message={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
  confirmText="Eliminar"
  cancelText="Cancelar"
  variant="danger"
  isLoading={isDeleting}
/>
```

**NEVER** use native `confirm()` or `window.confirm()` - always use `ConfirmModal` for consistency.

### Layering - Portals + Minimal Z-Index

Modals and slide panels use React Portals to escape the layout hierarchy:

```tsx
import { createPortal } from 'react-dom'

export function Modal({ children }) {
  return createPortal(
    <div className="fixed inset-0 z-50">{children}</div>,
    document.body
  )
}
```

**Z-index scale:**
- Header: `z-40`
- Modals/Panels: `z-50` (portaled to body)
- Dropdowns: `z-10` (within layout)
