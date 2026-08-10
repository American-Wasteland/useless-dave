import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useCompanyId } from '../../../hooks/useCompanyId'
import {
  costCenterKeys,
  getCostCenter,
  useCostCenters,
} from '../../../hooks/useCostCenters'
import type { CostCenterWizardData } from '../wizard/CostCenterWizard'
import { CostCenterWizard } from '../wizard/CostCenterWizard'

export function CostCenterEditPage() {
  const { costCenterId } = useParams<{ costCenterId: string }>()
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { updateCostCenter, isUpdating } = useCostCenters()

  const { data: costCenter, isLoading } = useQuery({
    queryKey: costCenterKeys.detail(companyId ?? '', costCenterId ?? ''),
    queryFn: () => getCostCenter(companyId!, costCenterId!),
    enabled: !!companyId && !!costCenterId,
  })

  const handleSubmit = async (data: CostCenterWizardData) => {
    if (!costCenterId) return
    await updateCostCenter(costCenterId, {
      type: data.type,
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      status: data.status,
    })
    navigate(`/${companyId}/accountancy/cost-centers`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!costCenter) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12 text-gray-500">
          Centro de costo no encontrado
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="Actualizar centro de costo">
      <CostCenterWizard
        mode="edit"
        initialData={{
          type: costCenter.type,
          name: costCenter.name,
          description: costCenter.description ?? '',
          status: costCenter.status,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />
    </PageLayout>
  )
}
