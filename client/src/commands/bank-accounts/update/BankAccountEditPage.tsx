import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import {
  bankAccountKeys,
  getBankAccount,
  useBankAccounts,
} from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'
import type { BankAccountWizardData } from '../wizard/BankAccountWizard'
import { BankAccountWizard } from '../wizard/BankAccountWizard'

export function BankAccountEditPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { updateBankAccount, isUpdating } = useBankAccounts()

  const { data: account, isLoading } = useQuery({
    queryKey: bankAccountKeys.detail(companyId ?? '', accountId ?? ''),
    queryFn: () => getBankAccount(companyId!, accountId!),
    enabled: !!companyId && !!accountId,
  })

  const handleSubmit = async (data: BankAccountWizardData) => {
    if (!accountId) return
    await updateBankAccount(accountId, { name: data.name.trim() })
    navigate(`/${companyId}/accountancy/bank-accounts/${accountId}`, {
      replace: true,
    })
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
    <PageLayout
      title="Actualizar cuenta bancaria"
      breadcrumbs={[
        { label: 'Inicio', href: `/${companyId}` },
        {
          label: 'Cuentas bancarias',
          href: `/${companyId}/accountancy/bank-accounts`,
        },
        {
          label: account.name,
          href: `/${companyId}/accountancy/bank-accounts/${accountId}`,
        },
        { label: 'Actualizar cuenta bancaria' },
      ]}
    >
      <BankAccountWizard
        mode="edit"
        initialData={{ name: account.name }}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />
    </PageLayout>
  )
}
