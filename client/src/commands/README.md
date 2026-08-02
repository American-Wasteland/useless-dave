# Commands Architecture

Each command is self-contained in its own package with UI, hooks, and domain logic.

## Structure

```
commands/
  <domain>/                    # e.g., accounting-categories
    create/
      command.ts              # Command definition (name, icon, params)
      CreatePanel.tsx         # UI panel
      useCreateX.ts           # Command-specific React Query hook
    find/
      command.ts
      FindPanel.tsx
      useFindX.ts
    delete/
      ...
    shared/
      service.ts              # Firestore operations
      types.ts                # TypeScript types
      queryKeys.ts            # React Query keys
    index.ts                  # Exports all commands & panels
```

## Adding a New Command

### 1. Create the folder structure

```bash
mkdir -p client/src/commands/<domain>/<action>
mkdir -p client/src/commands/<domain>/shared
```

### 2. Define the command (`command.ts`)

```typescript
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const myCommand: CommandDefinition = {
  id: 'my-command-id',
  name: '/mi-comando',           // Spanish name
  description: 'Descripción',    // Spanish description
  icon: '🎯',
  targetPath: '/my-path',        // Where to navigate
  parameters: [
    {
      name: 'paramName',         // English in code
      label: 'Etiqueta',         // Spanish for user
      type: 'text',
      required: true,
      placeholder: 'ej: ejemplo',
    },
  ],
}
```

### 3. Create the UI panel (`MyPanel.tsx`)

```typescript
import { useSearchParams } from 'react-router-dom'
import { SlidePanel } from '../../../components/ui'

export function MyPanel() {
  const [searchParams] = useSearchParams()
  const param = searchParams.get('paramName') || ''

  // Your UI logic here

  return (
    <SlidePanel title="Mi Panel">
      {/* Your UI */}
    </SlidePanel>
  )
}
```

### 4. Create the hook (`useMyAction.ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'

export function useMyAction() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => myService(companyId!, data),
    onSuccess: () => {
      // Invalidate queries
    },
  })

  return {
    execute: mutation.mutateAsync,
    isLoading: mutation.isPending,
  }
}
```

### 5. Export from `index.ts`

```typescript
export { myCommand } from './action/command'
export { MyPanel } from './action/MyPanel'

export const myDomainCommands = [
  myCommand,
  // ... other commands
]
```

### 6. Register in the command registry

Edit `client/src/features/commands/commandRegistry.ts`:

```typescript
import { myDomainCommands } from '../../commands/my-domain'

export const COMMANDS: CommandDefinition[] = [
  ...accountingCategoryCommands,
  ...myDomainCommands,  // Add your commands
]
```

### 7. Add route in `App.tsx`

```typescript
import { MyPanel } from './commands/my-domain'

// In the Routes:
<Route path="my-path" element={<MyPanel />} />
```

## Example: Accounting Categories

See `client/src/commands/accounting-categories/` for a complete example with:
- **Create command**: `/crear-categoria-contable`
- **Find command**: `/buscar-categoria-contable`
- **Shared service**: Firestore CRUD operations
- **Shared types**: TypeScript interfaces

## Benefits of This Architecture

✅ **Self-contained**: Each command has all its code in one place
✅ **Scalable**: Easy to add/remove commands without affecting others
✅ **Reusable**: Shared domain logic in `shared/` folder
✅ **Type-safe**: TypeScript throughout
✅ **Maintainable**: Clear separation of concerns
