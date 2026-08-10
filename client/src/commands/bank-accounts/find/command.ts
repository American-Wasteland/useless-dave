import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findBankAccountCommand: CommandDefinition = {
  id: 'find-bank-account',
  name: '/buscar-cuenta-bancaria',
  description: 'Buscar una cuenta bancaria',
  icon: '🔍',
  targetPath: '/accountancy/bank-accounts',
  parameters: [],
  group: CommandGroup.BankAccounts,
  keywords: [
    'ver',
    'listar',
    'lista',
    'consultar',
    'mostrar',
    'todos',
    'banco',
    'ahorro',
    'corriente',
  ],
}
