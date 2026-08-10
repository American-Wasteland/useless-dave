import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const findProviderCommand: CommandDefinition = {
  id: 'find-provider',
  name: '/buscar-proveedor',
  description: 'Buscar un proveedor por nombre o NIT',
  icon: '🔍',
  targetPath: '/accountancy/providers',
  group: CommandGroup.Providers,
  parameters: [],
  keywords: [
    'ver',
    'listar',
    'lista',
    'consultar',
    'mostrar',
    'todos',
    'empresa',
    'vendedor',
    'tercero',
    'contratista',
  ],
}
