import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createBankAccountCommand: CommandDefinition = {
  id: 'create-bank-account',
  name: '/crear-cuenta-bancaria',
  description: 'Crear una nueva cuenta bancaria',
  icon: '🏦',
  targetPath: '/accountancy/bank-accounts/create',
  parameters: [],
  group: CommandGroup.BankAccounts,
  keywords: [
    'nuevo',
    'agregar',
    'registrar',
    'banco',
    'ahorro',
    'corriente',
    'bancolombia',
    'davivienda',
    'nequi',
  ],
}
