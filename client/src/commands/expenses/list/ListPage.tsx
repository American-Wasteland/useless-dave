import { useQuery } from '@tanstack/react-query'
import { FileText, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { ConfirmModal, Currency } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useExpenses } from '../../../hooks/useExpenses'
import * as providerService from '../../providers/shared/providerService'
import { providerKeys } from '../../providers/shared/queryKeys'
import {
  calculateExpenseFinancials,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from '../shared/expenseUtils'

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

const QUICK_RANGES = [
  {
    label: 'Este mes',
    range: () => {
      const today = new Date()
      return {
        from: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toDateStr(today),
      }
    },
  },
  {
    label: '30 días',
    range: () => {
      const today = new Date()
      const from = new Date(today)
      from.setDate(today.getDate() - 30)
      return { from: toDateStr(from), to: toDateStr(today) }
    },
  },
  {
    label: '3 meses',
    range: () => {
      const today = new Date()
      const from = new Date(today)
      from.setMonth(today.getMonth() - 3)
      return { from: toDateStr(from), to: toDateStr(today) }
    },
  },
  {
    label: '6 meses',
    range: () => {
      const today = new Date()
      const from = new Date(today)
      from.setMonth(today.getMonth() - 6)
      return { from: toDateStr(from), to: toDateStr(today) }
    },
  },
  {
    label: 'Este año',
    range: () => {
      const today = new Date()
      return {
        from: toDateStr(new Date(today.getFullYear(), 0, 1)),
        to: toDateStr(today),
      }
    },
  },
]

function getDefaultDateRange() {
  return QUICK_RANGES[0].range()
}

export function ListExpensesPage() {
  const companyId = useCompanyId()
  const [searchParams, setSearchParams] = useSearchParams()
  const focusSearch =
    searchParams.get('focus') === 'search' || !!searchParams.get('q')

  // Filter values live in the URL
  const defaultRange = getDefaultDateRange()
  const from = searchParams.get('from') ?? defaultRange.from
  const to = searchParams.get('to') ?? defaultRange.to
  const qParam = searchParams.get('q') ?? ''

  // Local state only for the input display value (debounces URL write)
  const [inputQuery, setInputQuery] = useState(qParam)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (inputQuery.trim()) {
            next.set('q', inputQuery.trim())
          } else {
            next.delete('q')
          }
          return next
        },
        { replace: true },
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [inputQuery, setSearchParams])

  const setDateRange = (range: { from: string; to: string }) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('from', range.from)
        next.set('to', range.to)
        return next
      },
      { replace: true },
    )
  }

  const { expenses, isLoading, isFetching, deleteExpense, isDeleting } =
    useExpenses({ from, to, search: qParam || undefined })

  const { data: providers } = useQuery({
    queryKey: providerKeys.list(companyId || ''),
    queryFn: () => providerService.getProviders(companyId!),
    enabled: !!companyId,
  })
  const providerMap = new Map(providers?.map((p) => [p.id, p.name]) ?? [])

  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    title: string
  } | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusSearch) {
      searchRef.current?.focus()
    }
  }, [focusSearch])

  const list = expenses ?? []

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirm({ id, title })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    try {
      await deleteExpense(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <PageLayout
      maxWidth="7xl"
      title="Gastos"
      subtitle={`${expenses?.length ?? 0} gasto${(expenses?.length ?? 0) !== 1 ? 's' : ''} registrado${(expenses?.length ?? 0) !== 1 ? 's' : ''}`}
      breadcrumbs={[
        { label: 'Inicio', href: `/${companyId}` },
        { label: 'Gastos' },
      ]}
      actions={
        <Link
          to={`/${companyId}/accountancy/expenses/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Registrar gasto
        </Link>
      }
    >
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar gasto"
        message={`¿Estás seguro de que deseas eliminar el gasto "${deleteConfirm?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Quick pills */}
        <div className="flex items-center gap-1.5">
          {QUICK_RANGES.map((preset) => {
            const r = preset.range()
            const isActive = from === r.from && to === r.to
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDateRange(r)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {isActive && isFetching && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {preset.label}
              </button>
            )
          })}
        </div>

        {/* Custom range inputs */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setDateRange({ from: e.target.value, to })}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
          />
          <span className="text-gray-300">→</span>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setDateRange({ from, to: e.target.value })}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
        />
      </div>

      {list.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">
            {qParam
              ? `No se encontraron gastos para "${qParam}"`
              : 'No hay gastos registrados. Usa '}
            {!qParam && (
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                /registrar-gasto
              </code>
            )}
            {!qParam && ' para crear uno.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((expense) => {
                const financials = calculateExpenseFinancials(expense)
                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(expense.expenseDate).toLocaleDateString(
                          'es-CO',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/${companyId}/accountancy/expenses/${expense.id}`}
                        className="text-sm font-medium text-gray-900 before:absolute before:inset-0"
                      >
                        {expense.title}
                      </Link>
                      {providerMap.get(expense.providerId) && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {providerMap.get(expense.providerId)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        <Currency amount={financials.total} />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        A pagar: <Currency amount={financials.amountToPay} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(expense.paymentStatus)}`}
                      >
                        {getPaymentStatusLabel(expense.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative z-10">
                      <div className="flex items-center justify-end gap-2">
                        {expense.invoiceUrl && (
                          <a
                            href={expense.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Ver factura"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          to={`/${companyId}/accountancy/expenses/${expense.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(expense.id, expense.title)
                          }
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  )
}
