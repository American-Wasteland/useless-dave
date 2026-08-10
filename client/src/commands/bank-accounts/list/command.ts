import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const listBankAccountsCommand: CommandDefinition = {
  id: 'list-bank-accounts',
  name: '/cuentas-bancarias',
  description: 'Ver todas las cuentas bancarias',
  icon: '🏦',
  targetPath: '/accountancy/bank-accounts',
  parameters: [],
  group: CommandGroup.BankAccounts,
  keywords: [
    'buscar',
    'listar',
    'consultar',
    'mostrar',
    'banco',
    'ahorro',
    'corriente',
    'crear',
  ],
}
