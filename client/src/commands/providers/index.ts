// Export all commands for this domain
import { createProviderCommand } from './create/command'
import { findProviderCommand } from './find/command'
import { listProvidersCommand } from './list/command'

// Export panels
export { CreateProviderPanel } from './create/CreatePanel'
// Export individual commands
export { createProviderCommand } from './create/command'
export { findProviderCommand } from './find/command'
export { FindProviderPanel } from './find/FindPanel'
export { listProvidersCommand } from './list/command'
// Export pages
export { ListProvidersPage } from './list/ListPage'

// Collect all commands for easy registration
export const providerCommands = [
  createProviderCommand,
  findProviderCommand,
  listProvidersCommand,
]
