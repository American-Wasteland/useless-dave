import {
  Building2,
  Check,
  CreditCard,
  FolderKanban,
  Loader2,
  Receipt,
  Search,
  Tag,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { ChatToolCall } from '../../../types'

interface ToolCallCardProps {
  toolCall: ChatToolCall
  isStreaming?: boolean
}

type ToolConfig = {
  icon: typeof Search
  label: string
  color: string
  bgColor: string
}

const TOOL_CONFIG: Record<string, ToolConfig> = {
  search_accounting_categories: {
    icon: Search,
    label: 'Buscando categorías',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  create_accounting_category: {
    icon: Tag,
    label: 'Creando categoría',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  search_providers: {
    icon: Search,
    label: 'Buscando proveedores',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  search_cost_centers: {
    icon: Search,
    label: 'Buscando centros de costo',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  search_payment_accounts: {
    icon: Search,
    label: 'Buscando cuentas',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  create_provider: {
    icon: Building2,
    label: 'Creando proveedor',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  create_cost_center: {
    icon: FolderKanban,
    label: 'Creando centro de costo',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  create_expense: {
    icon: Receipt,
    label: 'Registrando gasto',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
  record_payment: {
    icon: CreditCard,
    label: 'Registrando pago',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  get_recent_expenses: {
    icon: Receipt,
    label: 'Consultando gastos',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
}

function formatInputValue(key: string, value: unknown): string {
  if (typeof value === 'number') {
    if (
      key.toLowerCase().includes('amount') ||
      key.toLowerCase().includes('total')
    ) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(value)
    }
    return value.toString()
  }
  return String(value)
}

function InputPreview({ input }: { input: Record<string, unknown> }) {
  const entries = Object.entries(input).filter(
    ([, v]) => v !== undefined && v !== '',
  )

  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 text-xs"
        >
          <span className="text-muted-foreground">{key}:</span>
          <span className="font-medium">{formatInputValue(key, value)}</span>
        </span>
      ))}
    </div>
  )
}

function ResultPreview({
  result,
  isCreate,
}: {
  result: string
  isCreate: boolean
}) {
  // Parse result for created items
  if (isCreate && result.includes('ID:')) {
    const lines = result.split('\n').filter(Boolean)
    return (
      <div className="mt-2 p-3 rounded-xl bg-white border-2 border-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="font-bold text-sm text-green-700">Creado</span>
        </div>
        <div className="space-y-1">
          {lines.map((line, i) => {
            const cleaned = line.replace(/^-\s*/, '')
            const [label, value] = cleaned.split(':').map((s) => s.trim())
            if (!value)
              return (
                <p key={i} className="text-sm">
                  {cleaned}
                </p>
              )
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-medium">{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Search results
  if (result.includes('Encontré')) {
    return (
      <div className="mt-2 p-3 rounded-xl bg-white border-2 border-border shadow-sm">
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>
    )
  }

  // Not found
  if (result.includes('No encontré')) {
    return (
      <div className="mt-2 p-3 rounded-xl bg-amber-50 border-2 border-amber-200">
        <p className="text-sm text-amber-800">{result}</p>
      </div>
    )
  }

  return (
    <div className="mt-2 p-3 rounded-xl bg-white border-2 border-border shadow-sm">
      <pre className="text-sm whitespace-pre-wrap">{result}</pre>
    </div>
  )
}

export function ToolCallCard({ toolCall, isStreaming }: ToolCallCardProps) {
  const config = TOOL_CONFIG[toolCall.name] || {
    icon: Search,
    label: toolCall.name,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  }

  const Icon = config.icon
  const isCreate = toolCall.name.startsWith('create_')
  const hasResult = !!toolCall.result

  return (
    <div
      className={cn(
        'rounded-2xl p-3 text-sm transition-all',
        config.bgColor,
        isStreaming && 'animate-pulse',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm',
            config.color,
          )}
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasResult ? (
            <Check className="h-4 w-4" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        <span className={cn('font-bold', config.color)}>{config.label}</span>
      </div>

      {/* Input preview */}
      <InputPreview input={toolCall.input} />

      {/* Result */}
      {hasResult && (
        <ResultPreview result={toolCall.result} isCreate={isCreate} />
      )}
    </div>
  )
}
