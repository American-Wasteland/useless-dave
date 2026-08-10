import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createAccountingCategoryCommand: CommandDefinition = {
  id: 'create-accounting-category',
  name: '/crear-categoria-contable',
  description: 'Crear una nueva categoría contable',
  icon: '📊',
  targetPath: '/accountancy/categories/create',
  group: CommandGroup.AccountingCategories,
  parameters: [],
  keywords: [
    'nuevo',
    'agregar',
    'registrar',
    'cuenta',
    'contabilidad',
    'clasificacion',
    'rubro',
    'gasto',
  ],
}
