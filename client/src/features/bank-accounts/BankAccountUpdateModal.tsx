import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, SlidePanel } from '../../components/ui'
import {
  bankAccountKeys,
  getBankAccount,
  useBankAccounts,
} from '../../hooks/useBankAccounts'
import { useCompanyId } from '../../hooks/useCompanyId'

interface Props {
  accountId: string
}

export function BankAccountUpdateModal({ accountId }: Props) {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { updateBankAccount } = useBankAccounts()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: account, isLoading } = useQuery({
    queryKey: bankAccountKeys.detail(companyId || '', accountId),
    queryFn: () => getBankAccount(companyId!, accountId),
    enabled: !!companyId && !!accountId,
  })

  useEffect(() => {
    if (account) {
      setName(account.name)
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await updateBankAccount(accountId, { name: name.trim() })
      navigate(
        `/${companyId}/accountancy/bank-accounts?modal=bankAccount&mode=view&id=${accountId}`,
      )
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
      <SlidePanel title="Actualizar cuenta bancaria">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </SlidePanel>
    )
  }

  if (!account) {
    return (
      <SlidePanel title="Actualizar cuenta bancaria">
        <div className="text-center py-12 text-gray-500">
          Cuenta bancaria no encontrada
        </div>
      </SlidePanel>
    )
  }

  return (
    <SlidePanel title="Actualizar cuenta bancaria">
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

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Actualizar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </div>
      </form>
    </SlidePanel>
  )
}
