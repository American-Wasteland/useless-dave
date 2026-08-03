export interface CommandParameterOption {
  value: string
  label: string // Spanish label shown to user
}

export interface CommandParameter {
  name: string
  label: string // Spanish label shown to user
  type: 'text' | 'number' | 'select'
  required: boolean
  placeholder?: string
  options?: CommandParameterOption[] // For select type
}

export interface CommandDefinition {
  id: string
  name: string // Spanish command name shown to user
  description: string // Spanish description
  icon: string // Emoji icon
  targetPath: string // Where to navigate after collecting params
  parameters: CommandParameter[]
}

// Import commands from their packages
import { accountingCategoryCommands } from '../../commands/accounting-categories'
import { bankAccountCommands } from '../../commands/bank-accounts'
import { costCenterCommands } from '../../commands/cost-centers'
import { providerCommands } from '../../commands/providers'

// Centralized command registry - commands are defined in their own packages
export const COMMANDS: CommandDefinition[] = [
  ...accountingCategoryCommands,
  ...bankAccountCommands,
  ...costCenterCommands,
  ...providerCommands,
  // Add more command collections here as you expand
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

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function searchCommands(input: string): CommandDefinition[] {
  const allCommands = !input || input === '/' ? COMMANDS : null

  if (allCommands) {
    return [...allCommands].sort((a, b) => a.name.localeCompare(b.name))
  }

  // Remove leading "/" and normalize for search (lowercase + no accents)
  const normalized = removeAccents(
    input.toLowerCase().trim().replace(/^\//, ''),
  )

  return COMMANDS.filter((cmd) => {
    const nameMatch = removeAccents(cmd.name.toLowerCase()).includes(normalized)
    const descMatch = removeAccents(cmd.description.toLowerCase()).includes(
      normalized,
    )
    return nameMatch || descMatch
  }).sort((a, b) => a.name.localeCompare(b.name))
}
