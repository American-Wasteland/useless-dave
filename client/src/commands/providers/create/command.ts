import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createProviderCommand: CommandDefinition = {
  id: 'create-provider',
  name: '/crear-proveedor',
  description: 'Crear un nuevo proveedor',
  icon: '🏢',
  targetPath: '/accountancy/providers/create',
  group: CommandGroup.Providers,
  parameters: [],
  keywords: [
    'nuevo',
    'agregar',
    'registrar',
    'empresa',
    'vendedor',
    'nit',
    'tercero',
    'contratista',
  ],
}
