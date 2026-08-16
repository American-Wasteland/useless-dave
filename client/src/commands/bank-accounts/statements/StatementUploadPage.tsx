import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { Button, FileUpload, MonthPicker } from '../../../components/ui'
import { useAuth } from '../../../features/auth/AuthContext'
import {
  bankAccountKeys,
  getBankAccount,
  useBankAccounts,
} from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'

export function StatementUploadPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const companyId = useCompanyId()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { uploadStatement } = useBankAccounts()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: account, isLoading } = useQuery({
    queryKey: bankAccountKeys.detail(companyId || '', accountId || ''),
    queryFn: () => getBankAccount(companyId!, accountId!),
    enabled: !!companyId && !!accountId,
  })

  const handleSubmit = async () => {
    if (!selectedMonth) {
      setError('Selecciona el mes del extracto')
      return
    }
    if (!selectedFile) {
      setError('Selecciona un archivo PDF')
      return
    }
    if (!user || !accountId) return

    setError(null)
    setIsSubmitting(true)
    try {
      await uploadStatement(accountId, selectedMonth, selectedFile, user.uid)
      navigate(
        `/${companyId}/accountancy/bank-accounts/${accountId}/statements`,
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al subir el extracto',
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

  return (
    <PageLayout
      title="Agregar extracto"
      maxWidth="3xl"
      breadcrumbs={[
        { label: 'Inicio', href: `/${companyId}` },
        {
          label: 'Cuentas bancarias',
          href: `/${companyId}/accountancy/bank-accounts`,
        },
        {
          label: account?.name ?? '…',
          href: `/${companyId}/accountancy/bank-accounts/${accountId}`,
        },
        { label: 'Agregar extracto' },
      ]}
    >
      <div className="card p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <MonthPicker
          label="Mes *"
          value={selectedMonth}
          onChange={setSelectedMonth}
        />

        <FileUpload
          label="Extracto bancario (PDF) *"
          accept="application/pdf"
          value={selectedFile}
          onChange={setSelectedFile}
        />

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMonth || !selectedFile}
            isLoading={isSubmitting}
          >
            Subir extracto
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
