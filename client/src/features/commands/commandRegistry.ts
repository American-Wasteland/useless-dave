export interface CommandParameter {
  name: string
  label: string // Spanish label shown to user
  type: 'text' | 'number'
  required: boolean
  placeholder?: string
}

export interface CommandDefinition {
  id: string
  name: string // Spanish command name shown to user
  description: string // Spanish description
  icon: string // Emoji icon
  targetPath: string // Where to navigate after collecting params
  parameters: CommandParameter[]
}

// Centralized command registry - easy to extend
export const COMMANDS: CommandDefinition[] = [
  {
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
  },
  {
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
  },
]

export function findCommand(input: string): CommandDefinition | undefined {
  const normalized = input.toLowerCase().trim()
  return COMMANDS.find(
    (cmd) =>
      cmd.name.toLowerCase() === normalized ||
      cmd.id === normalized ||
      cmd.name.toLowerCase().startsWith(normalized),
  )
}

export function searchCommands(input: string): CommandDefinition[] {
  if (!input || input === '/') return COMMANDS

  const normalized = input.toLowerCase().trim()
  return COMMANDS.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(normalized) ||
      cmd.description.toLowerCase().includes(normalized),
  )
}
