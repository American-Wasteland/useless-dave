import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createAccountingCategoryCommand: CommandDefinition = {
  id: 'create-accounting-category',
  name: '/crear-categoria-contable',
  description: 'Crear una nueva categoría contable',
  icon: '📊',
  targetPath: '/categories/create',
  parameters: [
    {
      name: 'name',
      label: 'Nombre de la categoría',
      type: 'text',
      required: true,
      placeholder: 'ej: Insumos médicos',
    },
    {
      name: 'description',
      label: 'Descripción (opcional)',
      type: 'text',
      required: false,
      placeholder: 'ej: Materiales e insumos para procedimientos',
    },
  ],
}
