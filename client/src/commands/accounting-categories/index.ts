// Export all commands for this domain
import { createAccountingCategoryCommand } from './create/command'
import { findAccountingCategoryCommand } from './find/command'
import { listAccountingCategoriesCommand } from './list/command'

// Export panels
export { CreateCategoryPanel } from './create/CreatePanel'
// Export individual commands
export { createAccountingCategoryCommand } from './create/command'
export { findAccountingCategoryCommand } from './find/command'
export { FindCategoryPanel } from './find/FindPanel'
export { listAccountingCategoriesCommand } from './list/command'
// Export pages
export { ListCategoriesPage } from './list/ListPage'

// Collect all commands for easy registration
export const accountingCategoryCommands = [
  createAccountingCategoryCommand,
  findAccountingCategoryCommand,
  listAccountingCategoriesCommand,
]
