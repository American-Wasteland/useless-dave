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
| Backend | Express + Firebase Functions (Node.js 20) |
| Database | Firestore (server-side only, never from client) |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage |
| Commands | Interactive command system (Spanish UI, English code) |
| Shared Types | `@useless-dave/shared` package (client + server) |

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

Currently only 2 commands (easy to add more):
- `/crear-categoria-contable` - Create accounting category
- `/buscar-categoria-contable` - Find accounting categories

### Adding a New Command

1. **Add to command registry** (`client/src/features/commands/commandRegistry.ts`):
   ```typescript
   {
     id: 'my-command',
     name: '/mi-comando',
     description: 'Descripción del comando',
     icon: '🎯',
     targetPath: '/my-page',
     parameters: [
       { name: 'param1', label: 'Parámetro 1', type: 'text', required: true },
     ],
   }
   ```

2. **Add route** in `App.tsx`:
   ```tsx
   <Route path="my-page" element={<MyPage />} />
   ```

3. **Create page component** that reads params from URL query string

That's it! The CommandInput handles the rest.

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
?modal={entity}&type={action}&id={id}
```

Examples:
- Create: `?modal=provider&type=create`
- View: `?modal=provider&type=view&id=123`
- Update: `?modal=provider&type=update&id=123`

#### Architecture

1. **Global ModalManager** (`client/src/components/modals/ModalManager.tsx`)
   - Placed inside `/:companyId` route in `App.tsx` (needs access to route params)
   - Routes to feature-specific modal managers based on `modal` param

2. **Feature Modal Manager** (e.g., `ProviderModalManager.tsx`)
   - Routes to specific modals based on `type` param
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
     const type = searchParams.get('type')
     const entityId = searchParams.get('id')

     switch (type) {
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
   - SlidePanel automatically clears `modal`, `type`, and `id` params on close
   - No need for manual `onClose` handlers

#### Navigation Best Practices

- **Use Links, not buttons**: Prefer `<Link to={url}>` over `onClick` handlers for better UX (right-click, copy link, browser history)
- **Back navigation**: Use `navigate(-1)` for back buttons to leverage browser history
- **Example**:
  ```typescript
  // Good: Edit button as Link
  const editUrl = (() => {
    const params = new URLSearchParams(searchParams)
    params.set('type', 'update')
    return `?${params.toString()}`
  })()

  <Link to={editUrl}>
    <Button>Editar</Button>
  </Link>

  // Back button
  <Button onClick={() => navigate(-1)}>Volver</Button>
  ```

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

- **Clickable rows**: Make entire rows clickable for view action
- **Action buttons**: Use `stopPropagation` to prevent row click:
  ```tsx
  <tr onClick={() => handleView(item.id)}>
    <td>
      <button onClick={(e) => {
        e.stopPropagation()
        handleEdit(item.id)
      }}>
        Edit
      </button>
    </td>
  </tr>
  ```

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
