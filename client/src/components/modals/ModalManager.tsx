import { useSearchParams } from 'react-router-dom'
import { ProviderModalManager } from '../../features/providers'

/**
 * Global modal manager that routes to feature-specific modal managers
 *
 * Query param format: ?modal={entity}&type={action}&id={id}
 *
 * Examples:
 * - ?modal=provider&type=create
 * - ?modal=provider&type=view&id=123
 * - ?modal=category&type=update&id=456
 */
export function ModalManager() {
  const [searchParams] = useSearchParams()
  const modal = searchParams.get('modal')

  switch (modal) {
    case 'provider':
      return <ProviderModalManager />
    // Add more modal managers here as needed
    // case 'category':
    //   return <CategoryModalManager />
    default:
      return null
  }
}
