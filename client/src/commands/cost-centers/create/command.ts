import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createCostCenterCommand: CommandDefinition = {
  id: 'create-cost-center',
  name: '/crear-centro-costo',
  description: 'Crear un nuevo centro de costo',
  icon: '📁',
  targetPath: '/accountancy/cost-centers/create',
  parameters: [],
}
