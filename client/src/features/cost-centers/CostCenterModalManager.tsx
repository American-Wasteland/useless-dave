import { useSearchParams } from 'react-router-dom'
import { FindCostCenterPanel } from '../../commands/cost-centers/find/FindPanel'
import { CostCenterCreateModal } from './CostCenterCreateModal'
import { CostCenterUpdateModal } from './CostCenterUpdateModal'
import { CostCenterViewModal } from './CostCenterViewModal'

/**
 * Manages cost center modals based on mode query parameter
 * Called by global ModalManager when modal=costCenter
 *
 * Usage:
 * - Find: ?modal=costCenter&mode=find
 * - Create: ?modal=costCenter&mode=create
 * - View: ?modal=costCenter&mode=view&id=costCenterId
 * - Update: ?modal=costCenter&mode=update&id=costCenterId
 */
export function CostCenterModalManager() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const costCenterId = searchParams.get('id')

  switch (mode) {
    case 'find':
      return <FindCostCenterPanel />
    case 'create':
      return <CostCenterCreateModal />
    case 'view':
      if (!costCenterId) return null
      return <CostCenterViewModal />
    case 'update':
      if (!costCenterId) return null
      return <CostCenterUpdateModal />
    default:
      return null
  }
}
