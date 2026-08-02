import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findAccountingCategoryCommand: CommandDefinition = {
  id: 'find-accounting-category',
  name: '/buscar-categoria-contable',
  description: 'Buscar categorías contables existentes',
  icon: '🔍',
  targetPath: '/categories',
  parameters: [
    {
      name: 'query',
      label: 'Buscar por nombre',
      type: 'text',
      required: true,
      placeholder: 'ej: Insumos',
    },
  ],
}
