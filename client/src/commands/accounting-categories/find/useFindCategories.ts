import { useQuery } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { getAccountingCategories } from '../shared/categoryService'
import { accountingCategoryKeys } from '../shared/queryKeys'

export function useFindCategories() {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: accountingCategoryKeys.list(companyId || ''),
    queryFn: () => getAccountingCategories(companyId!),
    enabled: !!companyId,
  })

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
