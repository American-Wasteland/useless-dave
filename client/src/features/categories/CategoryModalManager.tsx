import { useSearchParams } from 'react-router-dom'
import { CreateCategoryPanel } from '../../commands/accounting-categories/create/CreatePanel'
import { FindCategoryPanel } from '../../commands/accounting-categories/find/FindPanel'

/**
 * Manages category modals based on type query parameter
 * Called by global ModalManager when modal=category
 *
 * Usage:
 * - Find: ?modal=category&type=find
 * - Create: ?modal=category&type=create
 */
export function CategoryModalManager() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')

  switch (type) {
    case 'find':
      return <FindCategoryPanel />
    case 'create':
      return <CreateCategoryPanel />
    default:
      return null
  }
}
