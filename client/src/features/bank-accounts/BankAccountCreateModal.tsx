import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, SlidePanel } from '../../components/ui'
import { useBankAccounts } from '../../hooks/useBankAccounts'
import { useCompanyId } from '../../hooks/useCompanyId'

export function BankAccountCreateModal() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const { createBankAccount } = useBankAccounts()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill from query params if provided by command
  useEffect(() => {
    const nameParam = searchParams.get('name')
    if (nameParam) {
      setName(nameParam)
    }
  }, [searchParams])

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
    <SlidePanel title="Crear cuenta bancaria">
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
            Crear Cuenta
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </SlidePanel>
  )
}
