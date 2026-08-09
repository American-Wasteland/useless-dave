import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link
          to={`/${companyId}/accountancy/bank-accounts`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Crear cuenta bancaria
        </h1>
      </div>

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
    </div>
  )
}
