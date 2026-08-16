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

**Bank Accounts** (`/api/companies/:companyId/bank-accounts`)
- `GET /` - List all
- `POST /` - Create (requires `name`, `initialBalance: number`)
- `GET /:id` - Get by ID (statements sorted by month desc)
- `PATCH /:id` - Update
- `DELETE /:id` - Delete
- `POST /:id/statements` - Upload a statement PDF (`multipart/form-data`: `statement`, `month` YYYY-MM, `uploadedBy`)
- `DELETE /:id/statements/:month` - Delete a statement by month
- `GET /:id/movements` - List movements (sorted by date desc)

**Expenses** (`/api/companies/:companyId/expenses`)
- `GET /` - List all
- `POST /` - Create with invoice + payments atomically (`multipart/form-data`: all fields + `invoice` file + `payments` JSON + `payment-proof-{index}` files)
- `GET /:id` - Get by ID (includes payments subcollection)
- `PATCH /:id` - Update (optionally replace invoice)
- `DELETE /:id` - Delete (also removes payments + files)
- `GET /search/:query` - Search by title
- `POST /:id/payments` - Add payment (`multipart/form-data`: `bankAccountId`, `amount`, `date`, `notes`, optional `proof` file)
- `DELETE /:id/payments/:paymentId` - Delete payment (restores bank balance)

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

Hooks use React Query with optimistic updates:
```typescript
const updateMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: UpdateCostCenterInput }) => {
    return costCenterService.updateCostCenter(companyId!, id, data)
  },
  onMutate: async ({ id, data }) => {
    await queryClient.cancelQueries({ queryKey: costCenterKeys.list(companyId!) })
    const previous = queryClient.getQueryData(costCenterKeys.list(companyId!))
    queryClient.setQueryData(costCenterKeys.list(companyId!), (old: CostCenter[] = []) =>
      old.map((c) => (c.id === id ? { ...c, ...data } : c)),
    )
    return { previous }
  },
  onError: (_err, _vars, context) => {
    if (context?.previous) {
      queryClient.setQueryData(costCenterKeys.list(companyId!), context.previous)
    }
  },
  onSettled: () => {
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

The app uses a **command palette** — user selects a command and is immediately navigated to the relevant page. There is no step-by-step parameter collection.

### User Flow

```
1. User focuses input → "/" automatically added
2. Dropdown opens ABOVE input showing available commands
3. User types to filter or uses arrow keys to select
4. User presses Enter (or clicks) → immediately navigates to the target route
5. The target page handles all data collection (wizard, form, etc.)
```

### Architecture

**Centralized Config** — `client/src/features/commands/commandRegistry.ts`:

```typescript
export const COMMANDS: CommandDefinition[] = [
  {
    id: 'create-accounting-category',
    name: '/crear-categoria-contable',  // Spanish for users
    description: 'Crear una nueva categoría contable',
    icon: '📊',
    group: CommandGroup.Categories,
    targetPath: '/accountancy/categories/create',  // Route to navigate to
    parameters: [],  // Always empty — no inline param collection
    keywords: ['categoria', 'contable', 'nueva'],
  },
]
```

### Key Files

| File | Purpose |
|------|---------|
| `client/src/features/commands/commandRegistry.ts` | Centralized command definitions |
| `client/src/features/commands/CommandInterface.tsx` | Main UI with welcome screen |
| `client/src/features/commands/components/CommandInput.tsx` | Command palette input with dropdown |
| `server/src/dev-server.ts` | REST endpoints |

### Available Commands

- `/crear-categoria-contable` — Create accounting category
- `/crear-centro-costo` — Create cost center
- `/listar-centros-costo` — View all cost centers
- `/crear-proveedor` — Create provider
- `/buscar-proveedor` — List and search providers (auto-focuses search bar)

### Adding a New Command

1. **Add to command registry** (`client/src/features/commands/commandRegistry.ts`):
   ```typescript
   {
     id: 'my-command',
     name: '/mi-comando',
     description: 'Descripción del comando',
     icon: '🎯',
     group: CommandGroup.MyGroup,
     targetPath: '/accountancy/my-entity/create',
     parameters: [],  // Always empty
     keywords: ['keyword1', 'keyword2'],
   }
   ```

2. **Create the target page** — the route handles all user input

That's it. `CommandInput` navigates directly to `targetPath` with no intermediate steps.

### Search Commands (`queryMode`)

For commands that need a search query before navigating, add `queryMode` to the definition:

```typescript
{
  id: 'find-provider',
  name: '/buscar-proveedor',
  targetPath: '/accountancy/providers?focus=search',
  queryMode: {
    placeholder: 'Nombre, NIT o contacto del proveedor',
  },
  // ...
}
```

**Behaviour**: clicking the command fills the input with the command name and shows a prompt in the dropdown asking for a query. On Enter, navigates to `targetPath&q=<query>`.

The target list page must read `?q` on mount and initialize the search field with it:
```typescript
const [query, setQuery] = useState(searchParams.get('q') ?? '')
const focusSearch = searchParams.get('focus') === 'search' || !!searchParams.get('q')
```

## Bank Accounts

### Data Model

`BankAccount` stores statements as an embedded array (not a subcollection). Movements are a subcollection.

```typescript
interface BankAccount {
  id: string
  name: string
  initialBalance: number   // set once at creation, never changes
  currentBalance: number   // initialBalance ± linked expenses/incomes; updated whenever a payment is recorded against this account
  statements: BankStatement[]
}

interface BankStatement {
  id: string        // "{month}-{timestamp}"
  month: string     // YYYY-MM
  fileUrl: string   // public Firebase Storage URL
  fileName: string
  uploadedAt: string
  uploadedBy: string
}

interface BankMovement {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string      // ISO date string
  referenceType: 'expense' | 'income'
  createdAt: string
  createdBy: string
}
```

### Statement Rules

- Statements are sorted by `month` **descending** (most recent first) server-side in `getById()` — clients receive them pre-sorted
- Uploading a statement for a month that already exists **replaces** it (old file deleted from Storage)
- Upload returns the full updated `BankAccount` — use it to seed the React Query detail cache immediately (no refetch needed)
- Files stored at: `companies/{companyId}/bank-accounts/{accountId}/statements/statement-{YYYY-MM}.pdf`

### Routes

The bank account view page (`BankAccountViewPage`) is a **layout route** with nested tab routes:

```
/:companyId/accountancy/bank-accounts/:accountId          → BankAccountViewPage (layout)
/:companyId/accountancy/bank-accounts/:accountId/movements → MovementsTab (default)
/:companyId/accountancy/bank-accounts/:accountId/statements → StatementsTab
/:companyId/accountancy/bank-accounts/:accountId/statements/upload → StatementUploadPage
```

`BankAccountViewPage` passes `{ account }` via `<Outlet context={{ account }}>`. Child tabs read it with `useOutletContext<{ account: BankAccount }>()`.

### UI Components

- **`<Currency amount={n} />`** — Renders COP amounts with superscript cents. Use instead of `formatCurrency()` in JSX. Import from `client/src/components/ui`.
- **`<MonthPicker value onChange label />`** — Month/year picker (Radix Popover + custom grid). Outputs `YYYY-MM`. Default to previous month. Import from `client/src/components/ui`.

## Expenses

### Data Model

`Expense` stores core financial data. Payments are in a subcollection. Bank account balances are updated atomically when payments are created/deleted.

```typescript
interface Expense {
  id: string
  title: string
  providerId: string
  categoryId: string
  costCenterId: string        // Required

  // Colombian tax system
  subtotal: number
  iva: number                 // VAT
  reteFuente?: number         // Income tax withholding
  reteIca?: number            // Industry and commerce tax withholding

  invoiceUrl?: string         // Optional PDF or image (can be added later)

  payments: ExpensePayment[]  // Populated from subcollection on read
  paymentStatus: 'pending' | 'partial' | 'paid'

  expenseDate: string         // ISO date string
  createdAt: string
  updatedAt: string
}

interface ExpensePayment {
  id: string
  bankAccountId: string
  amount: number
  date: string
  notes?: string
  proofUrl?: string           // Optional PDF or image
  createdAt: string
}
```

### Creation Wizard

Expenses use a 5-step wizard (`client/src/commands/expenses/wizard/ExpenseWizard.tsx`):

1. **Info básica** — Title, date, provider, cost center, category
2. **Montos** — Subtotal (required), IVA, reteFuente, reteIca (auto-calculated based on provider rates)
3. **Factura** — Optional invoice upload (PDF or image)
4. **Pagos** — Optional payments with bank account, amount, date, notes, and proof file
5. **Estado** — Manual payment status selection (pending/partial/paid)

**Atomic Creation**: All data (expense + invoice + payments + proof files) is created in a single server-side operation. The server:
1. Creates the expense document
2. Uploads invoice file to Storage (if provided)
3. Creates payment documents in subcollection
4. Uploads payment proof files (if provided)
5. Updates bank account balances for all payments

### File Upload Pattern

The wizard uses `FormData` with `multipart/form-data`:
- `invoice` — Single file field for invoice
- `payments` — JSON string with array of payment data
- `payment-proof-0`, `payment-proof-1`, etc. — Indexed file fields for payment proofs

**Supported file types**: PDF, JPG, PNG, WebP

Server uses `multer` with `upload.any()` to accept dynamic field names.

### Key Rules

- **Collection names**: All Firestore collections use **camelCase** (e.g., `bankAccounts`, not `bank-accounts`)
- **Required fields**: Step 1 fields (title, date, provider, cost center, category) and subtotal use HTML5 `required` attribute
- **Firestore undefined**: Use conditional spread to avoid undefined fields: `...(invoiceFile && { invoiceUrl })`
- **Bank balance updates**: Payments automatically debit the selected bank account's `currentBalance`
- **Payment status**: Can be set manually in wizard or auto-calculated based on `amountToPay` vs `totalPaid`

### Routes

```
/:companyId/accountancy/expenses          → ExpenseListPage
/:companyId/accountancy/expenses/create   → ExpenseCreatePage (wizard)
/:companyId/accountancy/expenses/:id      → ExpenseViewPage (includes payment history)
```

## Entity Routes

Each entity has dedicated pages — no modals or slide panels.

| Entity | List | Create | View | Edit |
|--------|------|--------|------|------|
| Providers | `/accountancy/providers` | `.../create` | `.../:id` | `.../:id/edit` |
| Bank Accounts | `/accountancy/bank-accounts` | `.../create` | `.../:id` | `.../:id/edit` |
| Cost Centers | `/accountancy/cost-centers` | `.../create` | — | `.../:id/edit` |
| Categories | `/accountancy/categories` | `.../create` | — | inline in list |
| Expenses | `/accountancy/expenses` | `.../create` | `.../:id` | — |

### Wizard Pattern

Multi-field create/edit pages use a step wizard:
- Step state: `useSearchParams` (`?step=0`, `?step=1`, ...) — browser back/forward works between steps
- Form data: `useReducer` with a single `WizardData` object
- React Query optimistic updates on submit

```typescript
// Step navigation via URL
const [searchParams, setSearchParams] = useSearchParams()
const step = Number(searchParams.get('step') ?? '0')

const goTo = (n: number) => {
  setSearchParams({ step: String(n) }, { replace: true })
  setError(null)
}
```

Edit mode: mount the wizard only after the entity query resolves, so `initialData` is always fully populated.

#### Step indicator clickability

- **Completed steps** (`i < step`): always clickable in both modes
- **Current step** (`i === step`): never clickable
- **Future steps** (`i > step`): clickable only in **edit mode**, not in create mode

#### Navigation bar layout

```
[Cancelar]  ·····flex-1·····  [Atrás][Continuar / Submit]
```

- **Cancelar** — always visible on the far left, calls `navigate(-1)`
- **Atrás** — right side, shown only when `step > 0`
- **Continuar / Submit** — rightmost, always visible

#### Post-submit navigation

After successful wizard submission, always use `{ replace: true }` to prevent the back button from returning to wizard steps:

```typescript
const handleSubmit = async (data: WizardData) => {
  await createEntity(data)
  navigate(`/${companyId}/path/to/list`, { replace: true })
}
```

This replaces the wizard entry in the browser history, so clicking back goes to the page before the wizard, not the final wizard step.

### List Page Pattern

- `PageLayout` wraps the page with title, subtitle, and a "New X" button (top-right)
- Live client-side search bar with auto-focus via `?focus=search` URL param
- Stretched link pattern for clickable rows (see Table Patterns below)
- `ConfirmModal` for delete confirmations

### Special: `/buscar-proveedor`

Navigates to `/accountancy/providers?focus=search`. The providers list page detects this param and auto-focuses the search input using `useRef`.

## UI/UX Guidelines

- **Playful, not corporate** — Use the secondary teal color (#527575), fun copy, slight rotations on cards
- **No dark mode** — Light theme only
- **Spanish UI, English code** — All user-facing text in Spanish (Colombian), all code/variables in English
- **Command-driven** — Terminal aesthetic with `/` prefix for all commands
- **Dave branding** — Punk character with mohawk emblem (see `/public/dave-emblem.svg`)

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

### React Query Cache Strategy

**Always seed the cache from the server response — never just invalidate after a mutation.**

Mutations that return the updated entity should write it directly into the cache via `onSuccess`. This avoids a redundant refetch and ensures the UI reflects server state immediately after navigation.

```typescript
const updateMutation = useMutation({
  mutationFn: async ({ id, data }) => service.update(id, data), // returns updated entity

  // Optimistic pre-update (simple fields only — don't guess server-generated data)
  onMutate: async ({ id, data }) => {
    await queryClient.cancelQueries({ queryKey: keys.list(companyId!) })
    await queryClient.cancelQueries({ queryKey: keys.detail(companyId!, id) })
    const previousList = queryClient.getQueryData(keys.list(companyId!))
    const previousDetail = queryClient.getQueryData(keys.detail(companyId!, id))
    queryClient.setQueryData(keys.list(companyId!), (old) =>
      old?.map((item) => (item.id === id ? { ...item, ...data } : item)),
    )
    queryClient.setQueryData(keys.detail(companyId!, id), (old) =>
      old ? { ...old, ...data } : old,
    )
    return { previousList, previousDetail }
  },

  // Seed cache with accurate server response (includes server-generated fields like payment IDs)
  onSuccess: (updated, { id }) => {
    queryClient.setQueryData(keys.detail(companyId!, id), updated)
    queryClient.setQueryData(keys.list(companyId!), (old) =>
      old?.map((item) => (item.id === id ? updated : item)),
    )
  },

  // Roll back on failure
  onError: (_err, { id }, context) => {
    if (context?.previousList) queryClient.setQueryData(keys.list(companyId!), context.previousList)
    if (context?.previousDetail) queryClient.setQueryData(keys.detail(companyId!, id), context.previousDetail)
  },
  // No onSettled invalidation — onSuccess already has the correct state
})
```

**CRITICAL — query keys must be consistent everywhere:**
- Define keys in one place (e.g. `expenseKeys.detail(companyId, id)`)
- Every `useQuery` for the same entity — including view pages — must use the same key factory
- A mismatch means `onSuccess` seeds a key nobody reads → stale data on navigation

### Navigation Best Practices

- **CRITICAL**: Use `<Link>` for ALL navigation (not `onClick` with `navigate()`)
- Benefits: Better UX (right-click, copy link, browser history), proper accessibility
- **Back navigation**: Use `navigate(-1)` for back buttons to leverage browser history
- **Exception**: Delete actions can use buttons since they don't navigate (they open confirmation modals)

### UI Standards

#### Page Titles / Headings
- **Sentence case**: Only first word capitalized (Spanish style)
- Examples: "Detalle del proveedor", "Crear proveedor", "Actualizar proveedor"
- Never use title case ("Detalle Del Proveedor") or uppercase ("DETALLE DEL PROVEEDOR")

#### Field Labels
All field labels in forms use consistent styling:

```tsx
<div className="text-xs text-gray-500 font-medium normal-case">
  NIT
</div>
```

The `normal-case` utility is critical to override any inherited text transformations.

#### Table Patterns

**Clickable rows** — Use the "stretched link" pattern to make entire rows clickable:

**Pattern Requirements**:
- Row: `className="hover:bg-gray-50 transition-colors relative"`
- First column link: Add `before:absolute before:inset-0` to stretch over entire row
- Actions column: Add `relative z-10` to keep buttons/links clickable above the stretched link
- View action: First column link navigates to the view/detail page
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
          to={`/${companyId}/accountancy/entity/${item.id}`}
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
          to={`/${companyId}/accountancy/entity/${item.id}/edit`}
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

**Edit buttons** — Blue hover:
```tsx
className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
```

**Delete buttons** — Red hover:
```tsx
className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
```

**Delete confirmation** — Always use `ConfirmModal` component:
```tsx
import { ConfirmModal } from '../../../components/ui'

const [deleteConfirm, setDeleteConfirm] = useState<{
  id: string
  name: string
} | null>(null)

const handleDeleteClick = (id: string, name: string) => {
  setDeleteConfirm({ id, name })
}

const handleDeleteConfirm = async () => {
  if (!deleteConfirm) return
  try {
    await deleteEntity(deleteConfirm.id)
    setDeleteConfirm(null)
  } catch (err) {
    console.error('Error deleting:', err)
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

**NEVER** use native `confirm()` or `window.confirm()` — always use `ConfirmModal` for consistency.
