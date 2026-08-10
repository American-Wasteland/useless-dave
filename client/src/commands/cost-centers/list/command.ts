import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const listCostCentersCommand: CommandDefinition = {
  id: 'list-cost-centers',
  name: '/listar-centros-costo',
  description: 'Ver todos los centros de costo',
  icon: '📋',
  targetPath: '/accountancy/cost-centers',
  group: CommandGroup.CostCenters,
  parameters: [],
  keywords: [
    'listar',
    'consultar',
    'mostrar',
    'proyecto',
    'operacion',
    'departamento',
    'area',
  ],
}
