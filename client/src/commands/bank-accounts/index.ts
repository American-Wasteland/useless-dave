import { createBankAccountCommand } from './create/command'
import { listBankAccountsCommand } from './list/command'

export { createBankAccountCommand } from './create/command'
export { listBankAccountsCommand } from './list/command'
export { ListBankAccountsPage } from './list/ListPage'

export const bankAccountCommands = [
  createBankAccountCommand,
  listBankAccountsCommand,
]
