import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findProviderCommand: CommandDefinition = {
  id: 'find-provider',
  name: '/buscar-proveedor',
  description: 'Buscar un proveedor por nombre o NIT',
  icon: '🔍',
  targetPath: '/providers',
  parameters: [
    {
      name: 'query',
      label: 'Nombre o NIT del proveedor',
      type: 'text',
      required: false,
      placeholder: 'ej: Distribuidora o 900123456',
    },
  ],
}
