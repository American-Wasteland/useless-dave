import { Building2, FolderKanban, Receipt, Tag, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { ChatToolCall } from '../../../types'

interface ToolPreviewPanelProps {
  toolCall: ChatToolCall | null
  onClose: () => void
}

type ToolPreviewConfig = {
  icon: typeof Tag
  title: string
  color: string
  bgColor: string
}

const PREVIEW_CONFIG: Record<string, ToolPreviewConfig> = {
  create_accounting_category: {
    icon: Tag,
    title: 'Nueva Categoría Contable',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
  },
  create_provider: {
    icon: Building2,
    title: 'Nuevo Proveedor',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
  },
  create_cost_center: {
    icon: FolderKanban,
    title: 'Nuevo Centro de Costo',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
  },
  create_expense: {
    icon: Receipt,
    title: 'Nuevo Gasto',
    color: 'text-rose-600',
    bgColor: 'bg-rose-500',
  },
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  description: 'Descripción',
  query: 'Búsqueda',
  documentNumber: 'NIT / Cédula',
  address: 'Dirección',
  phone: 'Teléfono',
  email: 'Email',
  totalAmount: 'Monto Total',
  providerId: 'Proveedor',
  costCenterId: 'Centro de Costo',
  date: 'Fecha',
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '-'

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

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <dt className="text-sm text-muted-foreground mb-1">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function CreatedResult({ result }: { result: string }) {
  const lines = result.split('\n').filter(Boolean)
  const idLine = lines.find((l) => l.includes('ID:'))
  const id = idLine?.split('ID:')[1]?.trim()

  return (
    <div className="mt-6 p-4 rounded-2xl bg-green-50 border-2 border-green-200">
      <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
        <Check className="w-5 h-5" />
        Creado exitosamente
      </div>
      {id && (
        <p className="text-sm text-green-600">
          ID: <code className="bg-green-100 px-2 py-0.5 rounded">{id}</code>
        </p>
      )}
    </div>
  )
}

export function ToolPreviewPanel({ toolCall, onClose }: ToolPreviewPanelProps) {
  if (!toolCall) return null

  const config = PREVIEW_CONFIG[toolCall.name]
  if (!config) return null // Only show for create operations

  const Icon = config.icon
  const hasResult = !!toolCall.result
  const isSuccess = hasResult && toolCall.result.includes('ID:')

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/20 z-40 transition-opacity cursor-default"
        onClick={onClose}
        aria-label="Close panel"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md bg-background z-50',
          'shadow-2xl border-l border-border',
          'animate-in slide-in-from-right duration-300',
        )}
      >
        {/* Header */}
        <div className={cn('p-6 text-white', config.bgColor)}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">{config.title}</h2>
              <p className="text-white/80 text-sm">
                {hasResult ? 'Completado' : 'Procesando...'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
            Datos
          </h3>

          <dl className="bg-card rounded-2xl border-2 border-border p-4">
            {Object.entries(toolCall.input).map(([key, value]) => {
              if (value === undefined || value === '') return null
              const label = FIELD_LABELS[key] || key
              return (
                <PreviewField
                  key={key}
                  label={label}
                  value={formatValue(key, value)}
                />
              )
            })}
          </dl>

          {/* Result */}
          {isSuccess && <CreatedResult result={toolCall.result} />}

          {/* Loading state */}
          {!hasResult && (
            <div className="mt-6 flex items-center justify-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Creando...</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
