export const CommandGroup = {
  Providers: 'Proveedores',
  AccountingCategories: 'Categorías contables',
  CostCenters: 'Centros de costo',
  BankAccounts: 'Cuentas bancarias',
  Expenses: 'Gastos',
} as const

export type CommandGroupValue = (typeof CommandGroup)[keyof typeof CommandGroup]
