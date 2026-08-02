export interface CommandParameter {
  name: string
  type: 'string' | 'number' | 'date'
  description: string
  required: boolean
}

export interface Command {
  id: string
  name: string
  description: string
  category: 'contabilidad' | 'proveedores' | 'gastos' | 'centros-costo'
  parameters: CommandParameter[]
}

export interface CommandResult {
  success: boolean
  result?: string
  error?: string
}
