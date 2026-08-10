import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const listProvidersCommand: CommandDefinition = {
  id: 'list-providers',
  name: '/listar-proveedores',
  description: 'Ver todos los proveedores',
  icon: '📋',
  targetPath: '/accountancy/providers',
  group: CommandGroup.Providers,
  parameters: [],
  keywords: [
    'buscar',
    'listar',
    'consultar',
    'mostrar',
    'empresa',
    'vendedor',
    'tercero',
    'contratista',
    'nit',
  ],
}
