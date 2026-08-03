import { useSearchParams } from 'react-router-dom'
import { CreateCategoryPanel } from '../../commands/accounting-categories/create/CreatePanel'
import { FindCategoryPanel } from '../../commands/accounting-categories/find/FindPanel'

/**
 * Manages category modals based on mode query parameter
 * Called by global ModalManager when modal=category
 *
 * Usage:
 * - Find: ?modal=category&mode=find
 * - Create: ?modal=category&mode=create
 */
export function CategoryModalManager() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')

  switch (mode) {
    case 'find':
      return <FindCategoryPanel />
    case 'create':
      return <CreateCategoryPanel />
    default:
      return null
  }
}
