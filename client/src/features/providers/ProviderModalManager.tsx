import { useSearchParams } from 'react-router-dom'
import { FindProviderPanel } from '../../commands/providers/find/FindPanel'
import { ProviderCreateModal } from './ProviderCreateModal'
import { ProviderUpdateModal } from './ProviderUpdateModal'
import { ProviderViewModal } from './ProviderViewModal'

/**
 * Manages provider modals based on mode query parameter
 * Called by global ModalManager when modal=provider
 *
 * Usage:
 * - Find: ?modal=provider&mode=find
 * - Create: ?modal=provider&mode=create
 * - View: ?modal=provider&mode=view&id=providerId
 * - Update: ?modal=provider&mode=update&id=providerId
 */
export function ProviderModalManager() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const providerId = searchParams.get('id')

  switch (mode) {
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
