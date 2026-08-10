import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { Button, Input } from '../../../components/ui'
import { useBankAccounts } from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'

export function BankAccountCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createBankAccount } = useBankAccounts()

  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await createBankAccount({ name: name.trim() })
      navigate(`/${companyId}/accountancy/bank-accounts`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear cuenta bancaria',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout title="Crear cuenta bancaria">
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
              Crear cuenta
            </Button>
            <Link
              to={`/${companyId}/accountancy/bank-accounts`}
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
