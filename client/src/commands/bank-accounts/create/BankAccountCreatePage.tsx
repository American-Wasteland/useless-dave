import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useBankAccounts } from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'
import type { BankAccountWizardData } from '../wizard/BankAccountWizard'
import { BankAccountWizard } from '../wizard/BankAccountWizard'

export function BankAccountCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createBankAccount, isCreating } = useBankAccounts()

  const handleSubmit = async (data: BankAccountWizardData) => {
    await createBankAccount({
      name: data.name.trim(),
      initialBalance: data.initialBalance,
    })
    navigate(`/${companyId}/accountancy/bank-accounts`, { replace: true })
  }

  return (
    <PageLayout
      title="Crear cuenta bancaria"
      breadcrumbs={[
        { label: 'Inicio', href: `/${companyId}` },
        {
          label: 'Cuentas bancarias',
          href: `/${companyId}/accountancy/bank-accounts`,
        },
        { label: 'Crear cuenta bancaria' },
      ]}
    >
      <BankAccountWizard
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
      />
    </PageLayout>
  )
}
