import { useSearchParams } from 'react-router-dom'
import { CategoryModalManager } from '../../features/categories/CategoryModalManager'
import { CostCenterModalManager } from '../../features/cost-centers/CostCenterModalManager'
import { ProviderModalManager } from '../../features/providers'

/**
 * Global modal manager that routes to feature-specific modal managers
 *
 * Query param format: ?modal={entity}&mode={action}&id={id}
 *
 * Examples:
 * - ?modal=provider&mode=create
 * - ?modal=provider&mode=view&id=123
 * - ?modal=category&mode=update&id=456
 */
export function ModalManager() {
  const [searchParams] = useSearchParams()
  const modal = searchParams.get('modal')

  switch (modal) {
    case 'provider':
      return <ProviderModalManager />
    case 'category':
      return <CategoryModalManager />
    case 'costCenter':
      return <CostCenterModalManager />
    default:
      return null
  }
}
