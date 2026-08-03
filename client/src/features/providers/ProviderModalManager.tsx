import { useSearchParams } from 'react-router-dom'
import { FindProviderPanel } from '../../commands/providers/find/FindPanel'
import { ProviderCreateModal } from './ProviderCreateModal'
import { ProviderUpdateModal } from './ProviderUpdateModal'
import { ProviderViewModal } from './ProviderViewModal'

/**
 * Manages provider modals based on type query parameter
 * Called by global ModalManager when modal=provider
 *
 * Usage:
 * - Find: ?modal=provider&type=find
 * - Create: ?modal=provider&type=create
 * - View: ?modal=provider&type=view&id=providerId
 * - Update: ?modal=provider&type=update&id=providerId
 */
export function ProviderModalManager() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const providerId = searchParams.get('id')

  switch (type) {
    case 'find':
      return <FindProviderPanel />
    case 'create':
      return <ProviderCreateModal />
    case 'view':
      if (!providerId) return null
      return <ProviderViewModal />
    case 'update':
      if (!providerId) return null
      return <ProviderUpdateModal />
    default:
      return null
  }
}
