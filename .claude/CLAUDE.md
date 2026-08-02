# Useless Dave - AI Context

## Project Overview

Useless Dave is a small business ERP. The name references a punk/skater aesthetic (Tony Hawk American Wasteland vibes) - the UI should feel fun and playful, not corporate.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | React Query (TanStack Query) |
| Linting | Biome (root-level config) |
| Backend | Firebase Functions (Node.js 20) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage |
| AI | Gemini (for Dave chat assistant) |

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

## Key Files

| File | Purpose |
|------|---------|
| `client/src/features/auth/AuthContext.tsx` | Auth state, companies list, Google sign-in |
| `client/src/features/auth/ProtectedRoute.tsx` | Route guards with company validation |
| `client/src/features/company/companyService.ts` | Create company, fetch memberships, upload logo |
| `client/src/features/company/CompanySelector.tsx` | Multi-company picker |
| `client/src/features/chat/` | Dave AI chat interface |
| `firestore.rules` | Security rules (company-scoped access) |
| `storage.rules` | File upload rules |
| `biome.json` | Linting config (root level, covers client + server) |

## UI/UX Guidelines

- **Playful, not corporate** - Use the secondary teal color (#527575), fun copy, slight rotations on cards
- **No dark mode** - Light theme only
- **Spanish UI** - All user-facing text in Spanish (Colombian), but NO spanglish or slang
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
