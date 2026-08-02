import type { FunctionDeclaration, SchemaType } from '@google/generative-ai'

export const toolSchemas: FunctionDeclaration[] = [
  {
    name: 'search_providers',
    description:
      'Busca proveedores por nombre. Siempre usar antes de crear uno nuevo.',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        query: {
          type: 'string' as SchemaType.STRING,
          description: 'Texto para buscar en nombres de proveedores',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_cost_centers',
    description:
      'Busca centros de costo por nombre. Siempre usar antes de crear uno nuevo.',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        query: {
          type: 'string' as SchemaType.STRING,
          description: 'Texto para buscar en nombres de centros de costo',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_payment_accounts',
    description: 'Busca cuentas de pago por nombre (ej: Bold, Bancolombia).',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        query: {
          type: 'string' as SchemaType.STRING,
          description: 'Texto para buscar en nombres de cuentas de pago',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_provider',
    description:
      'Crea un nuevo proveedor. Solo usar si search_providers no encontró coincidencias.',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        name: {
          type: 'string' as SchemaType.STRING,
          description: 'Nombre del proveedor',
        },
        rut: {
          type: 'string' as SchemaType.STRING,
          description: 'NIT o RUT del proveedor',
        },
        address: {
          type: 'string' as SchemaType.STRING,
          description: 'Dirección (opcional)',
        },
        phone: {
          type: 'string' as SchemaType.STRING,
          description: 'Teléfono (opcional)',
        },
        email: {
          type: 'string' as SchemaType.STRING,
          description: 'Email (opcional)',
        },
      },
      required: ['name', 'rut'],
    },
  },
  {
    name: 'create_cost_center',
    description:
      'Crea un nuevo centro de costo. Solo usar si search_cost_centers no encontró coincidencias.',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        name: {
          type: 'string' as SchemaType.STRING,
          description: 'Nombre del centro de costo',
        },
        description: {
          type: 'string' as SchemaType.STRING,
          description: 'Descripción opcional',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'create_expense',
    description: 'Crea un gasto/compra. Requiere providerId y costCenterId.',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        providerId: {
          type: 'string' as SchemaType.STRING,
          description: 'ID del proveedor',
        },
        costCenterId: {
          type: 'string' as SchemaType.STRING,
          description: 'ID del centro de costo',
        },
        totalAmount: {
          type: 'number' as SchemaType.NUMBER,
          description: 'Monto total en pesos',
        },
        taxDeductions: {
          type: 'number' as SchemaType.NUMBER,
          description: 'Deducciones de impuestos. Default: 0',
        },
        description: {
          type: 'string' as SchemaType.STRING,
          description: 'Descripción del gasto',
        },
        date: {
          type: 'string' as SchemaType.STRING,
          description: 'Fecha YYYY-MM-DD. Default: hoy',
        },
        invoiceUrl: {
          type: 'string' as SchemaType.STRING,
          description: 'URL de la factura',
        },
      },
      required: ['providerId', 'costCenterId', 'totalAmount', 'description'],
    },
  },
  {
    name: 'record_payment',
    description: 'Registra un pago para un gasto existente.',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        expenseId: {
          type: 'string' as SchemaType.STRING,
          description: 'ID del gasto a pagar',
        },
        paymentAccountId: {
          type: 'string' as SchemaType.STRING,
          description: 'ID de la cuenta de pago',
        },
        amount: {
          type: 'number' as SchemaType.NUMBER,
          description: 'Monto del pago',
        },
        date: {
          type: 'string' as SchemaType.STRING,
          description: 'Fecha YYYY-MM-DD. Default: hoy',
        },
        notes: {
          type: 'string' as SchemaType.STRING,
          description: 'Notas (opcional)',
        },
        voucherUrl: {
          type: 'string' as SchemaType.STRING,
          description: 'URL del comprobante',
        },
      },
      required: ['expenseId', 'paymentAccountId'],
    },
  },
  {
    name: 'get_recent_expenses',
    description: 'Obtiene los gastos más recientes.',
    parameters: {
      type: 'object' as SchemaType.OBJECT,
      properties: {
        limit: {
          type: 'number' as SchemaType.NUMBER,
          description: 'Número de gastos. Default: 10',
        },
        status: {
          type: 'string' as SchemaType.STRING,
          description: 'Filtrar por estado: pending, partial, paid',
        },
      },
      required: [],
    },
  },
]

export const SYSTEM_PROMPT = `Eres Dave, un asistente de contabilidad amigable para una empresa colombiana. Tu trabajo es ayudar a registrar gastos, compras y pagos de manera conversacional.

PERSONALIDAD:
- Amable y profesional, pero casual (tuteas al usuario)
- Conciso en tus respuestas
- Confirmas las acciones importantes antes de ejecutarlas

REGLAS:
1. SIEMPRE busca antes de crear (search_providers, search_cost_centers, search_payment_accounts)
2. Si no encuentras algo, pregunta si quieres crearlo
3. Si faltan datos obligatorios, pídelos
4. Después de crear un gasto, pregunta si quieres registrar el pago
5. Muestra un resumen claro de lo que hiciste

DATOS OBLIGATORIOS PARA GASTOS:
- Proveedor (nombre)
- Monto total
- Centro de costo (cliente/proyecto)
- Descripción

FORMATO DE MONEDA:
- Usa formato colombiano: $150.000 para 150 mil pesos`
