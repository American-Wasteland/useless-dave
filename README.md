# Useless Dave - Small Business ERP

A lightweight, fun ERP system designed for small businesses. Named after the punk spirit of not taking things too seriously.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Linting | Biome |
| Backend | Express + Firebase Functions (Node.js 20) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage |
| Hosting | Firebase Hosting |

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

### Adding a New Command

**1. Add to registry** (`client/src/features/commands/commandRegistry.ts`):

```typescript
{
  id: 'create-provider',
  name: '/crear-proveedor',              // Spanish name
  description: 'Crear un nuevo proveedor',
  icon: '🏢',
  targetPath: '/providers/create',
  parameters: [
    {
      name: 'name',                       // English param name
      label: 'Nombre del proveedor',     // Spanish prompt
      type: 'text',
      required: true,
    },
  ],
}
```

**2. Add route** in `App.tsx`:
```tsx
<Route path="providers/create" element={<CreateProviderPage />} />
```

**3. Create page component** that reads params from URL query string:
```tsx
import { useSearchParams } from 'react-router-dom'

export function CreateProviderPage() {
  const [searchParams] = useSearchParams()
  const name = searchParams.get('name') || ''
  // Execute API call and display results
}
```

That's it! The command automatically appears in the dropdown.

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

**Format**: `?modal={entity}&type={action}&id={id}`

**Examples**:
- Create: `?modal=provider&type=create`
- View: `?modal=provider&type=view&id=abc123`
- Update: `?modal=provider&type=update&id=abc123`

**Benefits**:
- Deep-linkable (share/bookmark modal states)
- Browser back/forward works naturally
- Right-click to open in new tab
- No state synchronization issues

**Architecture**:
1. Global `ModalManager` routes by `modal` param
2. Feature managers (e.g., `ProviderModalManager`) route by `type` param
3. Individual modals use `SlidePanel` which auto-closes by clearing params

### UI Standards

**Typography**:
- Modal titles: Sentence case (`"Detalle del proveedor"`, not `"Detalle Del Proveedor"`)
- Field labels: `text-xs text-gray-500 font-medium normal-case`
- Spanish UI, English code (always)

**Navigation**:
- Use `<Link>` over `onClick` for better UX (right-click, copy link)
- Back buttons use `navigate(-1)` to leverage browser history
- Table rows are clickable for view, action buttons use `stopPropagation`

**Example**:
```tsx
// Good: Edit as Link
<Link to="?modal=provider&type=update&id=123">
  <Button>Editar</Button>
</Link>

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
├── server/                           # Express + Firebase Functions
│   └── src/
│       ├── commands/registry.ts      # Server command registry
│       ├── dev-server.ts             # REST endpoints
│       └── tools/handlers.ts         # Business logic
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
