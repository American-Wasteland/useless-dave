import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findAccountingCategoryCommand: CommandDefinition = {
  id: 'find-accounting-category',
  name: '/buscar-categoria-contable',
  description: 'Buscar categorías contables existentes',
  icon: '🔍',
  targetPath: '/accountancy/categories',
  group: CommandGroup.AccountingCategories,
  parameters: [],
  keywords: [
    'ver',
    'listar',
    'lista',
    'consultar',
    'mostrar',
    'todos',
    'cuenta',
    'contabilidad',
    'rubro',
    'gasto',
  ],
}
