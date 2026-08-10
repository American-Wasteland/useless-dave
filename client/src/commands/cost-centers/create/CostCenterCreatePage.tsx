import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCostCenters } from '../../../hooks/useCostCenters'
import type { CostCenterWizardData } from '../wizard/CostCenterWizard'
import { CostCenterWizard } from '../wizard/CostCenterWizard'

export function CostCenterCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createCostCenter, isCreating } = useCostCenters()

  const handleSubmit = async (data: CostCenterWizardData) => {
    await createCostCenter({
      type: data.type,
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      status: 'active',
    })
    navigate(`/${companyId}/accountancy/cost-centers`)
  }

  return (
    <PageLayout title="Crear centro de costo">
      <CostCenterWizard mode="create" onSubmit={handleSubmit} isSubmitting={isCreating} />
    </PageLayout>
  )
}
