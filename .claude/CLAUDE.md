# Useless Dave - AI Context

## Project Overview

Useless Dave is a small business ERP with a command-based interface. The name references a punk/skater aesthetic (Tony Hawk American Wasteland vibes) - the UI should feel fun and playful, not corporate.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | React Query (TanStack Query) |
| Linting | Biome (root-level config) |
| Backend | Express + Firebase Functions (Node.js 20) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage |
| Commands | Deterministic command system (Spanish) |

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

The app uses a **deterministic command system** instead of AI/LLM. No free-text chat - everything is command-based.

### Architecture

```
User types "/" → Command palette shows options → User selects command → Router navigates to /:companyId/comando/:commandId → Panel opens on right side → Form submission → API call → Result displayed
```

### Key Files

| File | Purpose |
|------|---------|
| `client/src/features/commands/registry.ts` | Command definitions (Spanish names) |
| `client/src/features/commands/CommandView.tsx` | Main view with command palette |
| `client/src/features/commands/components/CommandPalette.tsx` | Autocomplete input |
| `client/src/features/commands/components/CommandPanel.tsx` | Generic form panel |
| `server/src/commands/registry.ts` | Server-side command registry |
| `server/src/dev-server.ts` | Express endpoints for each command |
| `server/src/tools/handlers.ts` | Business logic for each command |

### Adding a New Command

1. **Add to server registry** (`server/src/commands/registry.ts`)
2. **Add endpoint** in `server/src/dev-server.ts`:
   ```ts
   app.post('/commands/mi-comando', async (req, res) => {
     const { companyId, param1, param2 } = req.body
     const result = await myHandler(getContext(companyId), { param1, param2 })
     res.json({ success: true, result })
   })
   ```
3. **Add to client registry** (`client/src/features/commands/registry.ts`)
4. Test with command palette!

### Available Commands

- `/buscar-categoria-contable` - Search accounting categories
- `/crear-categoria-contable` - Create accounting category
- `/buscar-proveedor` - Search providers
- `/crear-proveedor` - Create provider
- `/buscar-centro-costo` - Search cost centers
- `/crear-centro-costo` - Create cost center
- `/buscar-cuenta-pago` - Search payment accounts
- `/crear-gasto` - Create expense
- `/registrar-pago` - Record payment
- `/ver-gastos` - View recent expenses

## UI/UX Guidelines

- **Playful, not corporate** - Use the secondary teal color (#527575), fun copy, slight rotations on cards
- **No dark mode** - Light theme only
- **Spanish UI** - All user-facing text in Spanish (Colombian), but NO spanglish or slang
- **Command-driven** - Terminal aesthetic with `/` prefix for all commands
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

### Company-Scoped Queries

```typescript
const companyId = useCompanyId() // from URL params
const query = useQuery({
  queryKey: ['someData', companyId],
  queryFn: () => fetchData(companyId!),
  enabled: !!companyId, // guards the non-null assertion
})
```

### Router-Based Panels

All panels are router-based, not state-based:
```typescript
// Navigate to panel
navigate(`/${companyId}/comando/crear-categoria-contable`)

// Close panel
navigate(`/${companyId}`)
```
