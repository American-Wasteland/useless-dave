import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const listBankAccountsCommand: CommandDefinition = {
  id: 'list-bank-accounts',
  name: '/cuentas-bancarias',
  description: 'Ver todas las cuentas bancarias',
  icon: '🏦',
  targetPath: '/accountancy/bank-accounts',
  parameters: [],
}
