import {
  ArrowRight,
  Building2,
  FolderKanban,
  Receipt,
  Wallet,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Currency } from '../components/ui'
import { useAuth } from '../features/auth'
import { useExpenses } from '../features/expenses'

export function HomePage() {
  const { user, companies } = useAuth()
  const { companyId } = useParams<{ companyId: string }>()
  const company = companies.find((c) => c.id === companyId)
  const { expenses } = useExpenses()

  const pendingExpenses = expenses.filter((e) => e.paymentStatus === 'pending')
  const partialExpenses = expenses.filter((e) => e.paymentStatus === 'partial')
  const totalPending = [...pendingExpenses, ...partialExpenses].reduce(
    (sum, e) => sum + e.totalAmount,
    0,
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.displayName?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-gray-600">{company?.name || 'Mi Empresa'}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Gastos Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingExpenses.length + partialExpenses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Wallet className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Por Pagar</p>
              <p className="text-2xl font-bold text-gray-900">
                <Currency amount={totalPending} />
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FolderKanban className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pagados</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.filter((e) => e.paymentStatus === 'paid').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to={`/${companyId}/expenses/new`}
          className="card p-6 hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Receipt className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Registrar Gasto</h3>
                <p className="text-sm text-gray-500">Agrega un nuevo gasto</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>

        <Link
          to={`/${companyId}/expenses`}
          className="card p-6 hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Receipt className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ver Gastos</h3>
                <p className="text-sm text-gray-500">Administra tus gastos</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  )
}
