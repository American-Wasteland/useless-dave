import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useCompanyId } from '../../../hooks/useCompanyId'
import type { WizardData } from '../wizard/ProviderWizard'
import { ProviderWizard } from '../wizard/ProviderWizard'
import { useCreateProvider } from './useCreateProvider'

export function ProviderCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createProvider, isCreating } = useCreateProvider()

  const handleSubmit = async (data: WizardData) => {
    const files: { rut?: File; bankAccount?: File } = {}
    if (data.rutFile) files.rut = data.rutFile
    if (data.bankAccountFile) files.bankAccount = data.bankAccountFile

    await createProvider(
      {
        providerType: data.providerType,
        name: data.name.trim(),
        nit: data.nit.trim(),
        contactName: data.contactName.trim() || undefined,
        email: data.email.trim() || undefined,
        phone: data.phone.trim() || undefined,
        address: data.address.trim() || undefined,
      },
      Object.keys(files).length > 0 ? files : undefined,
    )
    navigate(`/${companyId}/accountancy/providers`)
  }

  return (
    <PageLayout title="Crear proveedor">
      <ProviderWizard mode="create" onSubmit={handleSubmit} isSubmitting={isCreating} />
    </PageLayout>
  )
}
