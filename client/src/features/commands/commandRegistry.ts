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

import type { CommandGroupValue } from '@useless-dave/shared'

export interface CommandDefinition {
  id: string
  name: string // Spanish command name shown to user
  description: string // Spanish description
  icon: string // Emoji icon
  targetPath: string // Where to navigate after collecting params
  parameters: CommandParameter[]
  keywords?: string[] // Extra search terms (synonyms, alternate phrasings)
  group: CommandGroupValue
  queryMode?: {
    placeholder: string // Prompt shown in dropdown when waiting for query input
  }
}

// Import commands from their packages
import { accountingCategoryCommands } from '../../commands/accounting-categories'
import { bankAccountCommands } from '../../commands/bank-accounts'
import { costCenterCommands } from '../../commands/cost-centers'
import { expenseCommands } from '../../commands/expenses'
import { providerCommands } from '../../commands/providers'

// Centralized command registry - commands are defined in their own packages
export const COMMANDS: CommandDefinition[] = [
  ...accountingCategoryCommands,
  ...bankAccountCommands,
  ...costCenterCommands,
  ...expenseCommands,
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

function normalize(str: string): string {
  return removeAccents(str.toLowerCase().replace(/^\//, '').replace(/-/g, ' '))
}

function groupSortKey(a: CommandDefinition, b: CommandDefinition): number {
  const groupCmp = a.group.localeCompare(b.group, 'es')
  if (groupCmp !== 0) return groupCmp
  // Within a group: create first, then the rest
  const aIsCreate = a.name.startsWith('/crear') ? 0 : 1
  const bIsCreate = b.name.startsWith('/crear') ? 0 : 1
  return aIsCreate - bIsCreate
}

export function searchCommands(input: string): CommandDefinition[] {
  const query = normalize(input.trim())

  // Browse mode: show all commands grouped by entity (alphabetical), create-first within each group
  if (!query) {
    return [...COMMANDS].sort(groupSortKey)
  }

  const tokens = query.split(/\s+/).filter(Boolean)

  const scored = COMMANDS.map((cmd) => {
    const text = [
      normalize(cmd.name),
      normalize(cmd.description),
      ...(cmd.keywords ?? []).map(normalize),
    ].join(' ')

    const matchCount = tokens.filter((token) => text.includes(token)).length
    return { cmd, score: matchCount / tokens.length }
  })

  // Search mode: flat ranked results, no grouping
  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ cmd }) => cmd)
}
