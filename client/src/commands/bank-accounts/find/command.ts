import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findBankAccountCommand: CommandDefinition = {
  id: 'find-bank-account',
  name: '/buscar-cuenta-bancaria',
  description: 'Buscar una cuenta bancaria',
  icon: '🔍',
  targetPath: '/accountancy/bank-accounts?modal=bankAccount&mode=find',
  parameters: [
    {
      name: 'query',
      label: 'Nombre de la cuenta',
      type: 'text',
      required: true,
      placeholder: 'ej: Bancolombia',
    },
  ],
}
