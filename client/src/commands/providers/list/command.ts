import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const listProvidersCommand: CommandDefinition = {
  id: 'list-providers',
  name: '/listar-proveedores',
  description: 'Ver todos los proveedores',
  icon: '📋',
  targetPath: '/accountancy/providers',
  parameters: [],
}
