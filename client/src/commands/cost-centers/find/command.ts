import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findCostCenterCommand: CommandDefinition = {
  id: 'find-cost-center',
  name: '/buscar-centro-costo',
  description: 'Buscar un centro de costo',
  icon: '🔍',
  targetPath: '/accountancy/cost-centers',
  parameters: [],
}
