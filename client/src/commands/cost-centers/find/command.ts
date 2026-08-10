import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findCostCenterCommand: CommandDefinition = {
  id: 'find-cost-center',
  name: '/buscar-centro-costo',
  description: 'Buscar un centro de costo',
  icon: '🔍',
  targetPath: '/accountancy/cost-centers',
  parameters: [],
  group: CommandGroup.CostCenters,
  keywords: [
    'ver',
    'listar',
    'lista',
    'consultar',
    'mostrar',
    'todos',
    'proyecto',
    'operacion',
    'departamento',
  ],
}
