import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { providerKeys } from '../shared/queryKeys'
import type { WizardData } from '../wizard/ProviderWizard'
import { ProviderWizard } from '../wizard/ProviderWizard'
import { useProviderById } from './useProviderById'
import { useUpdateProvider } from './useUpdateProvider'

export function ProviderEditPage() {
  const { providerId } = useParams<{ providerId: string }>()
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const { provider, isLoading } = useProviderById(providerId ?? null)
  const { updateProvider, isUpdating } = useUpdateProvider()

  const handleSubmit = async (data: WizardData) => {
    if (!providerId) return
    const files: { rut?: File; bankAccount?: File } = {}
    if (data.rutFile) files.rut = data.rutFile
    if (data.bankAccountFile) files.bankAccount = data.bankAccountFile

    await updateProvider({
      providerId,
      data: {
        providerType: data.providerType,
        name: data.name.trim(),
        nit: data.nit.trim(),
        contactName: data.contactName.trim() || undefined,
        email: data.email.trim() || undefined,
        phone: data.phone.trim() || undefined,
        address: data.address.trim() || undefined,
        vatRate: data.vatRate,
        reteFuenteRate: data.reteFuenteRate,
        reteIcaRate: data.reteIcaRate,
      },
      files: Object.keys(files).length > 0 ? files : undefined,
    })
    navigate(`/${companyId}/accountancy/providers/${providerId}`, {
      replace: true,
    })
  }

  const handleDeleteDocument = async (doc: 'rut' | 'bankAccount') => {
    if (!providerId) return
    await updateProvider({
      providerId,
      data: { [doc === 'rut' ? 'rutUrl' : 'bankAccountUrl']: null },
    })
    queryClient.invalidateQueries({
      queryKey: providerKeys.detail(companyId!, providerId),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Proveedor no encontrado
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Actualizar proveedor"
      breadcrumbs={[
        { label: 'Inicio', href: `/${companyId}` },
        { label: 'Proveedores', href: `/${companyId}/accountancy/providers` },
        {
          label: provider.name,
          href: `/${companyId}/accountancy/providers/${providerId}`,
        },
        { label: 'Actualizar proveedor' },
      ]}
    >
      <ProviderWizard
        mode="edit"
        initialData={{
          providerType: provider.providerType,
          name: provider.name,
          nit: provider.nit,
          address: provider.address ?? '',
          contactName: provider.contactName ?? '',
          email: provider.email ?? '',
          phone: provider.phone ?? '',
          rutFile: null,
          bankAccountFile: null,
          vatRate: provider.vatRate ?? 19,
          reteFuenteRate: provider.reteFuenteRate ?? 0,
          reteIcaRate: provider.reteIcaRate ?? 0,
        }}
        existingRutUrl={provider.rutUrl}
        existingBankAccountUrl={provider.bankAccountUrl}
        onSubmit={handleSubmit}
        onDeleteDocument={handleDeleteDocument}
        isSubmitting={isUpdating}
      />
    </PageLayout>
  )
}
