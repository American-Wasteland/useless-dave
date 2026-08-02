import { useQuery } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { getProviders } from '../shared/providerService'
import { providerKeys } from '../shared/queryKeys'

export function useListProviders() {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: providerKeys.list(companyId!),
    queryFn: () => getProviders(companyId!),
    enabled: !!companyId,
  })

  return {
    providers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
