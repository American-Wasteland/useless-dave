import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { ConfirmModal, Currency } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useExpenses } from '../../../hooks/useExpenses'
import {
  calculateExpenseFinancials,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from '../shared/expenseUtils'

const ITEMS_PER_PAGE = 20

export function ListExpensesPage() {
  const companyId = useCompanyId()
  const { expenses, isLoading, deleteExpense, isDeleting } = useExpenses()
  const [searchParams] = useSearchParams()
  const focusSearch =
    searchParams.get('focus') === 'search' || !!searchParams.get('q')

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [currentPage, setCurrentPage] = useState(1)
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

  // Reset page when query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [])

  const filtered = query.trim()
    ? (expenses?.filter((e) => {
        const q = query.toLowerCase()
        return e.title.toLowerCase().includes(q)
      }) ?? [])
    : (expenses ?? [])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentExpenses = filtered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  )

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

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">
            {query.trim()
              ? `No se encontraron gastos para "${query}"`
              : 'No hay gastos registrados. Usa '}
            {!query.trim() && (
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                /registrar-gasto
              </code>
            )}
            {!query.trim() && ' para crear uno.'}
          </p>
        </div>
      ) : (
        <>
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
                    Monto a pagar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentExpenses.map((expense) => {
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
                        {/* TODO: Load provider/category names via cache layer */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          <Currency amount={financials.amountToPay} />
                        </div>
                        {financials.totalPaid > 0 && (
                          <div className="text-xs text-gray-500">
                            Pagado: <Currency amount={financials.totalPaid} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(expense.paymentStatus)}`}
                        >
                          {getPaymentStatusLabel(expense.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 relative z-10">
                        <div className="flex items-center justify-center gap-2">
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  )
}
