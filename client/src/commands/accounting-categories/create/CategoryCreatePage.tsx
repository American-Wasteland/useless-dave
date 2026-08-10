import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useCompanyId } from '../../../hooks/useCompanyId'
import type { CategoryWizardData } from '../wizard/CategoryWizard'
import { CategoryWizard } from '../wizard/CategoryWizard'
import { useCreateCategory } from './useCreateCategory'

export function CategoryCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createCategory, isCreating } = useCreateCategory()

  const handleSubmit = async (data: CategoryWizardData) => {
    await createCategory({ name: data.name.trim() })
    navigate(`/${companyId}/accountancy/categories`)
  }

  return (
    <PageLayout title="Crear categoría contable">
      <CategoryWizard
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
      />
    </PageLayout>
  )
}
