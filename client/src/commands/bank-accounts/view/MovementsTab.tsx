import { useQuery } from '@tanstack/react-query'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Currency } from '../../../components/ui'
import { bankAccountKeys } from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'
import * as bankAccountService from '../shared/bankAccountService'
import type { BankMovement } from '../shared/types'

export function MovementsTab() {
  const { accountId } = useParams<{ accountId: string }>()
  const companyId = useCompanyId()

  const { data: movements = [] } = useQuery<BankMovement[]>({
    queryKey: [
      ...bankAccountKeys.detail(companyId || '', accountId || ''),
      'movements',
    ],
    queryFn: () => bankAccountService.getMovements(companyId!, accountId!),
    enabled: !!companyId && !!accountId,
  })

  if (movements.length === 0) {
    return (
      <div className="text-center py-12">
        <ArrowUpRight className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No hay movimientos registrados</p>
        <p className="text-xs text-gray-300 mt-1">
          Los movimientos aparecerán cuando se registren pagos o ingresos
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {movements.map((movement) => (
        <div
          key={movement.id}
          className="flex items-center justify-between py-4"
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-full ${
                movement.type === 'credit'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {movement.type === 'credit' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {movement.description}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(movement.date).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                {' · '}
                {movement.referenceType === 'expense' ? 'Gasto' : 'Ingreso'}
              </p>
            </div>
          </div>
          <p
            className={`text-sm font-semibold tabular-nums ${
              movement.type === 'credit' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {movement.type === 'credit' ? '+' : '-'}
            <Currency amount={movement.amount} />
          </p>
        </div>
      ))}
    </div>
  )
}
