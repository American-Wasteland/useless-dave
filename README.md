# Useless Dave - Small Business ERP

A lightweight, fun ERP system designed for small businesses. Named after the punk spirit of not taking things too seriously.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Linting | Biome |
| Backend | Express REST API + Firebase Functions (Node.js 20) |
| Database | Firebase Firestore (server-side only) |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage |
| Hosting | Firebase Hosting |

## Architecture

### Backend REST API

All data operations go through server-side REST endpoints. The client never accesses Firestore directly.

**Available Endpoints:**
- `/api/companies/:companyId/accounting-categories` - Category CRUD
- `/api/companies/:companyId/cost-centers` - Cost center CRUD
- `/api/companies/:companyId/providers` - Provider CRUD with file uploads

**Server Structure** (per entity):
- **Service** - Business logic (`server/src/commands/{entity}/service.ts`)
- **Routes** - Express handlers (`server/src/commands/{entity}/routes.ts`)
- **Shared Types** - TypeScript interfaces (`shared/types/{entity}.ts`)

**Client Structure** (per entity):
- **API Service** - HTTP client (`client/src/commands/{entity}/shared/{entity}Service.ts`)
- **React Query Hook** - State management (`client/src/hooks/use{Entity}.ts`)

Example:
```typescript
// Client service
export async function createCostCenter(companyId: string, data: CreateCostCenterInput) {
  return apiRequest(`/companies/${companyId}/cost-centers`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Hook
const { createCostCenter } = useCostCenters()
await createCostCenter({ name, type, status })
```

See `server/src/dev-server.ts` for full endpoint list.

## Features

- **Multi-Company Support** - Users can create and belong to multiple companies with isolated data
- **Interactive Command System** - Step-by-step guided commands instead of free-text input
- **Spanish UI, English Code** - User-facing in Spanish, codebase in English

## Command System

Useless Dave uses an interactive command system that guides users through operations step-by-step.

### How It Works

1. **User focuses input** → "/" automatically appears, dropdown opens above
2. **Select command** → Type or click to select (e.g., `/crear-categoria-contable`)
3. **Collect parameters** → Input prompts for each parameter one by one
4. **Navigate to result** → Opens page with collected parameters in URL

**Example Flow:**
```
User types: /crear-categoria-contable
Input prompts: "Nombre de la categoría" (1/2)
User types: "Insumos médicos" → Enter
Input prompts: "Descripción (opcional)" (2/2)
User types: "Materiales" → Enter
→ Navigates to: /categories/create?name=Insumos médicos&description=Materiales
```

### Available Commands

- `/crear-categoria-contable` - Create accounting category
- `/buscar-categoria-contable` - Find accounting categories
- `/crear-centro-costo` - Create cost center
- `/buscar-centro-costo` - Find cost centers
- `/crear-proveedor` - Create provider
- `/buscar-proveedor` - Find provider

### Entity Management Pattern

**All entity CRUD operations are centralized on a single dedicated page per entity.**

Each entity has:
- One dedicated page (e.g., `/accountancy/providers`)
- Commands that navigate to that page with modal query params
- All operations (create, find, view, update) handled through modals

**Example: Provider Commands**

```typescript
// Create provider command
{
  id: 'create-provider',
  name: '/crear-proveedor',
  description: 'Crear un nuevo proveedor',
  icon: '🏢',
  targetPath: '/accountancy/providers?modal=provider&mode=create',
  parameters: [...]
}

// Find provider command
{
  id: 'find-provider',
  name: '/buscar-proveedor',
  description: 'Buscar un proveedor',
  icon: '🔍',
  targetPath: '/accountancy/providers?modal=provider&mode=find',
  parameters: [{ name: 'query', ... }]
}
```

Both commands navigate to the same page (`/accountancy/providers`) but with different modal states.

### Adding a New Command

**1. Add to registry** (`client/src/features/commands/commandRegistry.ts`):

```typescript
{
  id: 'my-command',
  name: '/mi-comando',                    // Spanish name
  description: 'Descripción del comando',
  icon: '🎯',
  targetPath: '/my-entity?modal=myentity&mode=action',  // Navigate to entity page with modal
  parameters: [
    {
      name: 'paramName',                  // English param name
      label: 'Etiqueta del parámetro',   // Spanish prompt
      type: 'text',
      required: true,
    },
  ],
}
```

**2. Create modal manager and modals** (see Modal Management section below)

That's it! The command automatically appears in the dropdown and navigates with merged query params.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project

### 1. Clone and Install

```bash
git clone <repo-url>
cd useless-dave
npm install
```

### 2. Configure Firebase

```bash
firebase login
firebase use --add
```

### 3. Set Up Environment Variables

```bash
cd client
cp .env.example .env
```

Edit `client/.env` with your Firebase config from Firebase Console:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_EMULATORS=true
```

## Running the App

### With Firebase Emulators (Recommended)

```bash
# Terminal 1 - Start emulators
firebase emulators:start

# Terminal 2 - Start app
npm run dev
```

Open http://localhost:5173

Emulator UI at http://localhost:4000

### Direct to Firebase

Set `VITE_USE_EMULATORS=false` in `client/.env`, then:

```bash
npm run dev
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run build` | Build for production |
| `npm run deploy` | Build and deploy to Firebase |

## UI Conventions

### Modal Management

All modals use a **centralized query parameter system** for consistency:

**Format**: `?modal={entity}&mode={action}&id={id}`

**Examples**:
- Create: `?modal=provider&mode=create`
- View: `?modal=provider&mode=view&id=abc123`
- Update: `?modal=provider&mode=update&id=abc123`

**Benefits**:
- Deep-linkable (share/bookmark modal states)
- Browser back/forward works naturally
- Right-click to open in new tab
- No state synchronization issues

**Architecture**:
1. Global `ModalManager` routes by `modal` param
2. Feature managers (e.g., `ProviderModalManager`) route by `mode` param
3. Individual modals use `SlidePanel` which auto-closes by clearing ALL query params

**Important**: When `SlidePanel` closes (X button or backdrop click), it clears all query parameters from the URL. This ensures clean navigation back to the entity page.

### UI Standards

**Typography**:
- Modal titles: Sentence case (`"Detalle del proveedor"`, not `"Detalle Del Proveedor"`)
- Field labels: `text-xs text-gray-500 font-medium normal-case`
- Spanish UI, English code (always)

**Navigation**:
- **CRITICAL**: Use `<Link>` for ALL navigation (not `onClick` with `navigate()`)
- Back buttons use `navigate(-1)` to leverage browser history
- **Table rows**: Use the "stretched link" pattern for clickable rows:
  - Row: `className="hover:bg-gray-50 transition-colors relative"`
  - First column link: Add `before:absolute before:inset-0` to stretch over entire row
  - Actions column: Add `relative z-10` to keep buttons clickable above the stretched link
  - Edit action: Must be a `<Link>`, not a button
  - Delete action: Can be a button (no navigation, just triggers confirmation modal)

**Action Buttons**:
- Edit buttons: `hover:text-blue-600 hover:bg-blue-50`
- Delete buttons: `hover:text-red-600 hover:bg-red-50`
- All delete actions must use `ConfirmModal` (never native `confirm()`)
- Base color: `text-gray-400` (neutral when not hovered)

**Example**:
```tsx
// Good: Clickable table row with stretched link pattern
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

      {/* Actions column - must have z-10 to work above stretched link */}
      <td className="px-6 py-4 relative z-10">
        <div className="flex gap-2">
          {/* Edit: Must be Link */}
          <Link
            to={`/${companyId}/entity?modal=entity&mode=update&id=${item.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          {/* Delete: Button is OK (no navigation) */}
          <button
            onClick={() => handleDeleteClick(item.id, item.name)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

// Good: Delete with ConfirmModal
const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null)

<ConfirmModal
  isOpen={!!deleteConfirm}
  onClose={() => setDeleteConfirm(null)}
  onConfirm={handleDeleteConfirm}
  title="Eliminar entidad"
  message={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.name}"?`}
  variant="danger"
/>

// Good: Back button
<Button onClick={() => navigate(-1)}>Volver</Button>
```

## Multi-Company Architecture

Users can belong to multiple companies via `/users/{userId}/memberships/{companyId}`:

```
users/{userId}
  └── memberships/{companyId}
        └── companyId, role, joinedAt

companies/{companyId}
  ├── name, logoUrl?, createdAt, createdBy
  └── users/{userId}
        └── email, role
```

This enables:
- Querying which companies a user belongs to
- Role-based access per company (admin, editor, viewer)
- Company switching without re-authentication

## Project Structure

```
useless-dave/
├── client/                           # React SPA
│   ├── src/
│   │   ├── components/               # UI components and layouts
│   │   ├── features/
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── commands/             # Command system
│   │   │   │   ├── commandRegistry.ts  # Centralized command config
│   │   │   │   ├── CommandInterface.tsx
│   │   │   │   └── components/CommandInput.tsx
│   │   │   └── company/              # Company management
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Firebase config, utilities
│   │   └── types/                    # TypeScript interfaces
│   └── vite.config.ts
│
├── server/                           # Express REST API
│   └── src/
│       ├── commands/                 # Entity endpoints
│       │   ├── accounting-categories/
│       │   │   ├── service.ts        # Business logic
│       │   │   ├── routes.ts         # Express routes
│       │   │   └── types.ts          # Type exports
│       │   ├── cost-centers/
│       │   └── providers/
│       ├── dev-server.ts             # Main server & route registration
│       └── lib/                      # Firebase admin, utilities
│
├── shared/                           # Shared types package
│   └── types/                        # Entity DTOs
│       ├── accounting-categories.ts
│       ├── cost-centers.ts
│       ├── providers.ts
│       └── index.ts
│
├── biome.json                        # Linting configuration
├── firebase.json                     # Emulators + hosting config
├── firestore.rules                   # Security rules
└── storage.rules                     # File upload security
```

## Security

- All data is company-scoped
- Firestore rules enforce authentication and company membership
- Storage rules require authentication for file uploads

## License

Private - All rights reserved
