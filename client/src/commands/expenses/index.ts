import { CommandGroup } from '@useless-dave/shared'
import type { CommandDefinition } from '../../features/commands/commandRegistry'

export const expenseCommands: CommandDefinition[] = [
  {
    id: 'create-expense',
    name: '/registrar-gasto',
    description: 'Registrar un gasto',
    icon: '💸',
    group: CommandGroup.Expenses,
    targetPath: '/accountancy/expenses/create',
    parameters: [],
    keywords: ['gasto', 'nuevo', 'factura', 'invoice', 'crear'],
  },
  {
    id: 'list-expenses',
    name: '/listar-gastos',
    description: 'Ver todos los gastos',
    icon: '📋',
    group: CommandGroup.Expenses,
    targetPath: '/accountancy/expenses',
    parameters: [],
    keywords: ['gastos', 'listado', 'ver', 'facturas'],
  },
]
