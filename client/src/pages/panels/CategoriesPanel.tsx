import { useTranslation } from 'react-i18next'
import { SlidePanel } from '../../components/ui'
import { CategoriesPage } from '../CategoriesPage'

export function CategoriesPanel() {
  const { t } = useTranslation()

  return (
    <SlidePanel title={t('categories.title')} size="lg">
      <CategoriesPage hideHeader />
    </SlidePanel>
  )
}
