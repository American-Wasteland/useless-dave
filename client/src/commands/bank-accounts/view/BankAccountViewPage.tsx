import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { Button, Currency } from '../../../components/ui'
import { bankAccountKeys, getBankAccount } from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'

export function BankAccountViewPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const companyId = useCompanyId()

  const { data: account, isLoading } = useQuery({
    queryKey: bankAccountKeys.detail(companyId || '', accountId || ''),
    queryFn: () => getBankAccount(companyId!, accountId!),
    enabled: !!companyId && !!accountId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Cuenta bancaria no encontrada
        </div>
      </div>
    )
  }

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    [
      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
      isActive
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-500 hover:bg-white/60 hover:text-gray-800',
    ].join(' ')

  return (
    <PageLayout
      title={account.name}
      maxWidth="6xl"
      actions={
        <Link to={`/${companyId}/accountancy/bank-accounts/${accountId}/edit`}>
          <Button variant="secondary">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      }
    >
      {/* Balance */}
      <div className="card p-8 mb-6">
        <p className="text-sm text-gray-500 mb-1">Saldo actual</p>
        <p className="text-4xl font-bold text-gray-900">
          <Currency amount={account.currentBalance ?? 0} />
        </p>
        {(account.initialBalance ?? 0) !== (account.currentBalance ?? 0) && (
          <p className="text-xs text-gray-400 mt-2">
            Saldo inicial: <Currency amount={account.initialBalance ?? 0} />
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-2">
            <NavLink to="movements" className={tabClass}>
              Movimientos
            </NavLink>
            <NavLink to="statements" className={tabClass}>
              Extractos
              {account.statements?.length > 0 && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
                  {account.statements.length}
                </span>
              )}
            </NavLink>
          </div>
        </div>

        <div className="p-6">
          <Outlet context={{ account }} />
        </div>
      </div>
    </PageLayout>
  )
}
