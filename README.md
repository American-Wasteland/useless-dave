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
- `/api/companies/:companyId/bank-accounts` - Bank account CRUD
  - `POST /:id/statements` - Upload a statement PDF (multipart/form-data)
  - `DELETE /:id/statements/:month` - Delete a statement by month (`YYYY-MM`)
  - `GET /:id/movements` - List movements (sorted by date desc)
- `/api/companies/:companyId/expenses` - Expense CRUD with payments
  - `POST /` - Create expense with invoice + payments atomically (multipart/form-data)
  - `POST /:id/payments` - Add payment to expense (updates bank balance)
  - `DELETE /:id/payments/:paymentId` - Delete payment (restores bank balance)

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
- **Interactive Command System** - Command palette with direct navigation to dedicated pages
- **Spanish UI, English Code** - User-facing in Spanish, codebase in English
- **Expense Management** - Track expenses with Colombian tax system (IVA, reteFuente, reteIca), invoice uploads, and payment tracking
- **Bank Accounts** - Track accounts with balance, movements, and monthly statement PDFs (auto-updated when payments are recorded)
- **Step Wizards** - Multi-step forms with browser back/forward support

## Command System

Useless Dave uses a command palette that navigates directly to dedicated pages. No parameter collection happens in the command interface — all input is handled by the target page.

### How It Works

1. **User focuses input** → "/" automatically appears, dropdown opens above
2. **Select command** → Type or click to select (e.g., `/crear-proveedor`)
3. **Navigate immediately** → Opens the dedicated page for that action

**Example Flow:**
```
User types: /crear-proveedor
User selects command → Enter
→ Navigates to: /:companyId/accountancy/providers/create
→ User completes wizard with all provider details
```

### Available Commands

- `/crear-categoria-contable` - Create accounting category
- `/crear-centro-costo` - Create cost center
- `/listar-centros-costo` - View all cost centers
- `/crear-proveedor` - Create provider
- `/buscar-proveedor` - Search providers (with optional query)
- `/crear-cuenta-bancaria` - Create bank account
- `/registrar-gasto` - Create expense (5-step wizard)

### Search Commands

Some commands support an optional search query. When selected, the command waits for the user to type a query before navigating:

```typescript
{
  id: 'find-provider',
  name: '/buscar-proveedor',
  targetPath: '/accountancy/providers?focus=search',
  queryMode: {
    placeholder: 'Nombre, NIT o contacto del proveedor',
  },
}
```

The target page receives `?q=<query>` and pre-fills its search field.

## Expense Management

Expenses support the **Colombian tax system** with built-in handling for:
- **IVA** (VAT) - Auto-calculated based on provider's VAT rate
- **ReteFuente** (Income tax withholding) - Auto-calculated based on provider's rate
- **ReteIca** (Industry and commerce tax withholding) - Auto-calculated per-thousand rate

### Creation Wizard

Expenses are created through a 5-step wizard:

1. **Info básica** - Title, date, provider, cost center, category (all required)
2. **Montos** - Subtotal (required), IVA, reteFuente, reteIca (auto-calculated with override option)
3. **Factura** - Optional invoice upload (PDF or image: JPG, PNG, WebP)
4. **Pagos** - Optional initial payments with bank account, amount, date, notes, and proof files
5. **Estado** - Manual payment status selection (pending/partial/paid)

### Key Features

- **Atomic Creation** - Single server operation creates expense + uploads files + creates payments + updates bank balances
- **Payment Tracking** - Multiple payments per expense with optional proof files (PDF or images)
- **Bank Integration** - Bank account balances automatically update when payments are added/deleted
- **File Support** - Invoices and payment proofs can be PDF or images (JPG, PNG, WebP)

### Technical Notes

- Expenses are stored in Firestore at `companies/{companyId}/expenses/{expenseId}`
- Payments are stored in a subcollection: `expenses/{expenseId}/payments/{paymentId}`
- All Firestore collections use **camelCase** (e.g., `bankAccounts`, not `bank-accounts`)
- File uploads use `multipart/form-data` with dynamic field names (`payment-proof-0`, `payment-proof-1`, etc.)

### Entity Routes

Each entity uses dedicated pages for all CRUD operations:

| Entity | List | Create | View | Edit |
|--------|------|--------|------|------|
| Providers | `/accountancy/providers` | `.../create` | `.../:id` | `.../:id/edit` |
| Bank Accounts | `/accountancy/bank-accounts` | `.../create` | `.../:id` | `.../:id/edit` |
| Expenses | `/accountancy/expenses` | `.../create` | `.../:id` | — |
| Cost Centers | `/accountancy/cost-centers` | `.../create` | — | `.../:id/edit` |
| Categories | `/accountancy/categories` | `.../create` | — | inline edit |

### Adding a New Command

**1. Add to registry** (`client/src/features/commands/commandRegistry.ts`):

```typescript
{
  id: 'create-my-entity',
  name: '/crear-mi-entidad',              // Spanish name
  description: 'Crear una nueva entidad',
  icon: '🎯',
  group: CommandGroup.MyGroup,
  targetPath: '/accountancy/my-entity/create',
  parameters: [],  // Always empty — no inline collection
  keywords: ['entidad', 'crear'],
}
```

**2. Create the target page** — the route handles all user input (wizard, form, etc.)

That's it! The command appears in the dropdown and navigates directly.

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

### Page-Based Architecture

All entity CRUD operations use dedicated page routes (no modals):

```
/:companyId/accountancy/providers          → List
/:companyId/accountancy/providers/create   → Create wizard
/:companyId/accountancy/providers/:id      → View details
/:companyId/accountancy/providers/:id/edit → Edit wizard
```

### Wizard Pattern

Multi-step create/edit forms use step wizards with URL-based state:

**Key Features**:
- Step state via `useSearchParams` (`?step=0`, `?step=1`, etc.)
- Form data via `useReducer`
- Browser back/forward works between steps
- React Query optimistic updates on submit

**Navigation**:
```typescript
const [searchParams, setSearchParams] = useSearchParams()
const step = Number(searchParams.get('step') ?? '0')

const goTo = (n: number) => {
  setSearchParams({ step: String(n) }, { replace: true })
}
```

**Submit Navigation**:
Always use `{ replace: true }` to prevent back button from returning to wizard:

```typescript
const handleSubmit = async (data: WizardData) => {
  await createEntity(data)
  navigate(`/${companyId}/path/to/list`, { replace: true })
}
```

This replaces the wizard in history — clicking back goes to the page before the wizard.

### UI Standards

**Typography**:
- Page titles: Sentence case (`"Detalle del proveedor"`, not `"Detalle Del Proveedor"`)
- Field labels: `text-xs text-gray-500 font-medium normal-case`
- Spanish UI, English code (always)

**Navigation**:
- **CRITICAL**: Use `<Link>` for ALL navigation (not `onClick` with `navigate()`)
- Back buttons use `navigate(-1)` to leverage browser history
- **Table rows**: Use the "stretched link" pattern for clickable rows:
  - Row: `className="hover:bg-gray-50 transition-colors relative"`
  - First column link: Add `before:absolute before:inset-0` to stretch over entire row
  - Actions column: Add `relative z-10` to keep buttons/links clickable
  - Edit action: Must be a `<Link>`, not a button
  - Delete action: Can be a button (no navigation, opens confirmation modal)

**Action Buttons**:
- Edit buttons: `hover:text-blue-600 hover:bg-blue-50`
- Delete buttons: `hover:text-red-600 hover:bg-red-50`
- All delete actions must use `ConfirmModal` (never native `confirm()`)
- Base color: `text-gray-400` (neutral when not hovered)

**Example**:
```tsx
// Clickable table row with stretched link pattern
<tbody className="bg-white divide-y divide-gray-200">
  {items.map((item) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors relative">
      <td className="px-6 py-4">
        <Link
          to={`/${companyId}/accountancy/providers/${item.id}`}
          className="text-sm font-medium text-gray-900 before:absolute before:inset-0"
        >
          {item.name}
        </Link>
      </td>
      <td className="px-6 py-4 relative z-10">
        <Link
          to={`/${companyId}/accountancy/providers/${item.id}/edit`}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          onClick={() => handleDeleteClick(item.id, item.name)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  ))}
</tbody>

// Delete confirmation
<ConfirmModal
  isOpen={!!deleteConfirm}
  onClose={() => setDeleteConfirm(null)}
  onConfirm={handleDeleteConfirm}
  title="Eliminar proveedor"
  message={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.name}"?`}
  variant="danger"
/>
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
│   │   ├── commands/                 # Entity pages (organized by feature)
│   │   │   ├── providers/
│   │   │   │   ├── create/ProviderCreatePage.tsx
│   │   │   │   ├── view/ProviderViewPage.tsx
│   │   │   │   ├── update/ProviderEditPage.tsx
│   │   │   │   ├── list/ProvidersListPage.tsx
│   │   │   │   └── shared/providerService.ts
│   │   │   ├── bank-accounts/
│   │   │   │   ├── create/BankAccountCreatePage.tsx
│   │   │   │   ├── view/BankAccountViewPage.tsx
│   │   │   │   ├── update/BankAccountEditPage.tsx
│   │   │   │   └── shared/bankAccountService.ts
│   │   │   ├── expenses/
│   │   │   │   ├── create/ExpenseCreatePage.tsx
│   │   │   │   ├── view/ExpenseViewPage.tsx
│   │   │   │   ├── wizard/ExpenseWizard.tsx   # 5-step creation wizard
│   │   │   │   └── shared/expenseService.ts
│   │   │   ├── cost-centers/
│   │   │   └── accounting-categories/
│   │   ├── components/               # Shared UI components
│   │   │   ├── ui/                   # Base components (Currency, MonthPicker, etc.)
│   │   │   └── wizard/               # Wizard components (StepIndicator, etc.)
│   │   ├── features/
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── commands/             # Command system
│   │   │   │   ├── commandRegistry.ts  # Command definitions
│   │   │   │   ├── CommandInterface.tsx
│   │   │   │   └── components/CommandInput.tsx
│   │   │   └── company/              # Company management
│   │   ├── hooks/                    # Custom React hooks (useProvider, useBankAccounts)
│   │   ├── lib/                      # Firebase config, utilities
│   │   └── types/                    # TypeScript interfaces
│   └── vite.config.ts
│
├── server/                           # Express REST API
│   └── src/
│       ├── commands/                 # Entity endpoints
│       │   ├── accounting-categories/
│       │   │   ├── service.ts        # Business logic & Firestore ops
│       │   │   └── routes.ts         # Express routes
│       │   ├── cost-centers/
│       │   ├── providers/
│       │   ├── bank-accounts/
│       │   └── expenses/
│       ├── dev-server.ts             # Main server & route registration
│       └── lib/                      # Firebase admin, utilities
│
├── shared/                           # Shared types package
│   └── types/                        # Entity DTOs (used by client & server)
│       ├── accounting-categories.ts
│       ├── cost-centers.ts
│       ├── providers.ts
│       ├── bank-accounts.ts
│       ├── expenses.ts
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
