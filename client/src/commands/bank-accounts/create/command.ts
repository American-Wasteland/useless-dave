import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createBankAccountCommand: CommandDefinition = {
  id: 'create-bank-account',
  name: '/crear-cuenta-bancaria',
  description: 'Crear una nueva cuenta bancaria',
  icon: '🏦',
  targetPath: '/accountancy/bank-accounts/create',
  parameters: [],
}
