import { useQuery } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { getProviderById } from '../shared/providerService'
import { providerKeys } from '../shared/queryKeys'

export function useProviderById(providerId: string | null) {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: providerKeys.detail(companyId!, providerId!),
    queryFn: () => getProviderById(companyId!, providerId!),
    enabled: !!companyId && !!providerId,
  })

  return {
    provider: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}
