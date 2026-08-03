import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createCostCenterCommand: CommandDefinition = {
  id: 'create-cost-center',
  name: '/crear-centro-costo',
  description: 'Crear un nuevo centro de costo',
  icon: '📁',
  targetPath: '/accountancy/cost-centers?modal=costCenter&mode=create',
  parameters: [
    {
      name: 'type',
      label: 'Tipo de centro de costo',
      type: 'select',
      required: true,
      options: [
        { value: 'project', label: 'Proyecto' },
        { value: 'operation', label: 'Operación' },
      ],
    },
    {
      name: 'name',
      label: 'Nombre del centro de costo',
      type: 'text',
      required: true,
      placeholder: 'ej: Proyecto Sede Norte',
    },
    {
      name: 'description',
      label: 'Descripción (opcional)',
      type: 'text',
      required: false,
      placeholder: 'ej: Construcción de nueva sede',
    },
  ],
}
