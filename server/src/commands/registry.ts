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
  handler: string // Maps to handler function name
}

export const commands: Command[] = [
  {
    id: 'buscar-categoria-contable',
    name: '/buscar-categoria-contable',
    description: 'Buscar categorías contables por nombre',
    category: 'contabilidad',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Texto a buscar',
        required: true,
      },
    ],
    handler: 'searchAccountingCategories',
  },
  {
    id: 'crear-categoria-contable',
    name: '/crear-categoria-contable',
    description: 'Crear nueva categoría contable',
    category: 'contabilidad',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Nombre de la categoría',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Descripción (opcional)',
        required: false,
      },
    ],
    handler: 'createAccountingCategory',
  },
  {
    id: 'buscar-proveedor',
    name: '/buscar-proveedor',
    description: 'Buscar proveedores por nombre',
    category: 'proveedores',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Texto a buscar',
        required: true,
      },
    ],
    handler: 'searchProviders',
  },
  {
    id: 'crear-proveedor',
    name: '/crear-proveedor',
    description: 'Crear nuevo proveedor',
    category: 'proveedores',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Nombre del proveedor',
        required: true,
      },
      {
        name: 'rut',
        type: 'string',
        description: 'NIT o cédula',
        required: true,
      },
      {
        name: 'address',
        type: 'string',
        description: 'Dirección',
        required: false,
      },
      {
        name: 'phone',
        type: 'string',
        description: 'Teléfono',
        required: false,
      },
      {
        name: 'email',
        type: 'string',
        description: 'Email',
        required: false,
      },
    ],
    handler: 'createProvider',
  },
  {
    id: 'buscar-centro-costo',
    name: '/buscar-centro-costo',
    description: 'Buscar centros de costo',
    category: 'centros-costo',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Texto a buscar',
        required: true,
      },
    ],
    handler: 'searchCostCenters',
  },
  {
    id: 'crear-centro-costo',
    name: '/crear-centro-costo',
    description: 'Crear centro de costo',
    category: 'centros-costo',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Nombre del centro de costo',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Descripción',
        required: false,
      },
    ],
    handler: 'createCostCenter',
  },
  {
    id: 'crear-gasto',
    name: '/crear-gasto',
    description: 'Registrar un gasto',
    category: 'gastos',
    parameters: [
      {
        name: 'providerId',
        type: 'string',
        description: 'ID del proveedor',
        required: true,
      },
      {
        name: 'costCenterId',
        type: 'string',
        description: 'ID del centro de costo',
        required: true,
      },
      {
        name: 'totalAmount',
        type: 'number',
        description: 'Monto total',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Descripción del gasto',
        required: true,
      },
      {
        name: 'taxDeductions',
        type: 'number',
        description: 'Deducciones fiscales',
        required: false,
      },
      {
        name: 'date',
        type: 'date',
        description: 'Fecha del gasto',
        required: false,
      },
      {
        name: 'invoiceUrl',
        type: 'string',
        description: 'URL de la factura',
        required: false,
      },
    ],
    handler: 'createExpense',
  },
  {
    id: 'registrar-pago',
    name: '/registrar-pago',
    description: 'Registrar pago de un gasto',
    category: 'gastos',
    parameters: [
      {
        name: 'expenseId',
        type: 'string',
        description: 'ID del gasto',
        required: true,
      },
      {
        name: 'paymentAccountId',
        type: 'string',
        description: 'ID de la cuenta de pago',
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        description: 'Monto del pago',
        required: false,
      },
      {
        name: 'date',
        type: 'date',
        description: 'Fecha del pago',
        required: false,
      },
      {
        name: 'notes',
        type: 'string',
        description: 'Notas adicionales',
        required: false,
      },
      {
        name: 'voucherUrl',
        type: 'string',
        description: 'URL del comprobante',
        required: false,
      },
    ],
    handler: 'recordPayment',
  },
  {
    id: 'ver-gastos',
    name: '/ver-gastos',
    description: 'Ver gastos recientes',
    category: 'gastos',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        description: 'Número de gastos a mostrar',
        required: false,
      },
      {
        name: 'status',
        type: 'string',
        description: 'Filtrar por estado (pending, partial, paid)',
        required: false,
      },
    ],
    handler: 'getRecentExpenses',
  },
]
