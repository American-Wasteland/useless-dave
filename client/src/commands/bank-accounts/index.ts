// Export all commands for this domain
import { createBankAccountCommand } from './create/command'
import { findBankAccountCommand } from './find/command'
import { listBankAccountsCommand } from './list/command'

// Export individual commands
export { createBankAccountCommand } from './create/command'
export { findBankAccountCommand } from './find/command'
export { listBankAccountsCommand } from './list/command'
// Export pages
export { ListBankAccountsPage } from './list/ListPage'

// Collect all commands for easy registration
export const bankAccountCommands = [
  createBankAccountCommand,
  findBankAccountCommand,
  listBankAccountsCommand,
]
