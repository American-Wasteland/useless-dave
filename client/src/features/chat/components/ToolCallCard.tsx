import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FolderKanban,
  Receipt,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../../lib/utils'
import type { ChatToolCall } from '../../../types'

interface ToolCallCardProps {
  toolCall: ChatToolCall
  isStreaming?: boolean
}

const TOOL_ICONS: Record<string, typeof Search> = {
  search_providers: Search,
  search_cost_centers: Search,
  search_payment_accounts: Search,
  create_provider: Building2,
  create_cost_center: FolderKanban,
  create_expense: Receipt,
  record_payment: CreditCard,
  get_recent_expenses: Receipt,
  get_expense_details: Receipt,
}

const TOOL_LABELS: Record<string, string> = {
  search_providers: 'Buscando proveedores',
  search_cost_centers: 'Buscando centros de costo',
  search_payment_accounts: 'Buscando cuentas de pago',
  create_provider: 'Creando proveedor',
  create_cost_center: 'Creando centro de costo',
  create_expense: 'Registrando gasto',
  record_payment: 'Registrando pago',
  get_recent_expenses: 'Obteniendo gastos recientes',
  get_expense_details: 'Obteniendo detalles del gasto',
}

export function ToolCallCard({ toolCall, isStreaming }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const Icon = TOOL_ICONS[toolCall.name] || Search
  const label = TOOL_LABELS[toolCall.name] || toolCall.name

  return (
    <div className="rounded-lg border border-gray-200 bg-white text-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded',
            isStreaming
              ? 'animate-pulse bg-amber-100 text-amber-600'
              : 'bg-emerald-100 text-emerald-600',
          )}
        >
          {isStreaming ? (
            <Icon className="h-3.5 w-3.5" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </div>
        <span className="flex-1 text-gray-700">{label}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-3 py-2 space-y-2">
          {/* Input */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Entrada:</p>
            <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>

          {/* Result */}
          {toolCall.result && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Resultado:
              </p>
              <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                {toolCall.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
