import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const listAccountingCategoriesCommand: CommandDefinition = {
  id: 'list-accounting-categories',
  name: '/listar-categorias-contables',
  description: 'Ver todas las categorías contables',
  icon: '📋',
  targetPath: '/accountancy/categories',
  parameters: [],
  group: CommandGroup.AccountingCategories,
  keywords: [
    'buscar',
    'listar',
    'consultar',
    'mostrar',
    'cuenta',
    'contabilidad',
    'rubro',
    'gasto',
  ],
}
