import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findAccountingCategoryCommand: CommandDefinition = {
  id: 'find-accounting-category',
  name: '/buscar-categoria-contable',
  description: 'Buscar categorías contables existentes',
  icon: '🔍',
  targetPath: '/accountancy/categories?modal=category&type=find',
  parameters: [
    {
      name: 'query',
      label: 'Buscar por nombre',
      type: 'text',
      required: false,
      placeholder: 'ej: Insumos',
    },
  ],
}
