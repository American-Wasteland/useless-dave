import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { Button, Currency } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { getExpenseById } from '../shared/expenseService'
import { calculateExpenseFinancials } from '../shared/expenseUtils'

export function ExpenseViewPage() {
  const { expenseId } = useParams<{ expenseId: string }>()
  const companyId = useCompanyId()

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expenses', companyId, expenseId],
    queryFn: () => getExpenseById(companyId!, expenseId!),
    enabled: !!companyId && !!expenseId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Gasto no encontrado
        </div>
      </div>
    )
  }

  const financials = calculateExpenseFinancials(expense)

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    [
      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
      isActive
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-500 hover:bg-white/60 hover:text-gray-800',
    ].join(' ')

  return (
    <PageLayout
      title={expense.title}
      maxWidth="6xl"
      actions={
        <Link to={`/${companyId}/accountancy/expenses/${expenseId}/edit`}>
          <Button variant="secondary">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      }
    >
      {/* Financial summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-6">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            <Currency amount={financials.total} />
          </p>
        </div>
        <div className="card p-6">
          <p className="text-xs text-gray-500 mb-1">Monto a pagar</p>
          <p className="text-2xl font-bold text-gray-900">
            <Currency amount={financials.amountToPay} />
          </p>
        </div>
        <div className="card p-6">
          <p className="text-xs text-gray-500 mb-1">Pagado</p>
          <p className="text-2xl font-bold text-green-600">
            <Currency amount={financials.totalPaid} />
          </p>
        </div>
        <div className="card p-6">
          <p className="text-xs text-gray-500 mb-1">Pendiente</p>
          <p
            className={`text-2xl font-bold ${
              financials.remainingBalance > 0 ? 'text-red-600' : 'text-gray-400'
            }`}
          >
            <Currency amount={financials.remainingBalance} />
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-2">
            <NavLink to="general" className={tabClass}>
              General
            </NavLink>
            <NavLink to="payments" className={tabClass}>
              Pagos
              {expense.payments?.length > 0 && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
                  {expense.payments.length}
                </span>
              )}
            </NavLink>
          </div>
        </div>

        <div className="p-6">
          <Outlet context={{ expense }} />
        </div>
      </div>
    </PageLayout>
  )
}
