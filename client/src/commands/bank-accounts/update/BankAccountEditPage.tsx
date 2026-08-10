import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { Button, Input } from '../../../components/ui'
import {
  bankAccountKeys,
  getBankAccount,
  useBankAccounts,
} from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'

export function BankAccountEditPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { updateBankAccount } = useBankAccounts()

  const [name, setName] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: account, isLoading } = useQuery({
    queryKey: bankAccountKeys.detail(companyId || '', accountId || ''),
    queryFn: () => getBankAccount(companyId!, accountId!),
    enabled: !!companyId && !!accountId,
  })

  useEffect(() => {
    if (account && !loaded) {
      setName(account.name)
      setLoaded(true)
    }
  }, [account, loaded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !accountId) {
      setError('El nombre es requerido')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await updateBankAccount(accountId, { name: name.trim() })
      navigate(`/${companyId}/accountancy/bank-accounts/${accountId}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al actualizar cuenta bancaria',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="text-center py-12 text-gray-500">
          Cuenta bancaria no encontrada
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="Actualizar cuenta bancaria">
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Nombre de la cuenta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Bancolombia Ahorros"
            required
            autoFocus
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Actualizar cuenta
            </Button>
            <Link
              to={`/${companyId}/accountancy/bank-accounts/${accountId}`}
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}
