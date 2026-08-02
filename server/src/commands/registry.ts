export interface CommandParameter {
  name: string
  type: 'string' | 'number'
  required: boolean
}

export interface Command {
  id: string
  handler: string // Maps to handler function name
  parameters: CommandParameter[]
}

// Server-side command registry (matches client)
export const commands: Command[] = [
  {
    id: 'create-accounting-category',
    handler: 'createAccountingCategory',
    parameters: [
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
    ],
  },
  {
    id: 'find-accounting-category',
    handler: 'searchAccountingCategories',
    parameters: [{ name: 'query', type: 'string', required: true }],
  },
]
