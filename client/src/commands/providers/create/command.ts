import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createProviderCommand: CommandDefinition = {
  id: 'create-provider',
  name: '/crear-proveedor',
  description: 'Crear un nuevo proveedor',
  icon: '🏢',
  targetPath: '/accountancy/providers/create',
  parameters: [],
}
