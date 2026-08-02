import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../hooks/useCompanyId'
import type { ProviderFormData } from '../../types'
import { createProvider, deleteProvider, getProviders } from './providerService'

export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (companyId: string) => [...providerKeys.lists(), companyId] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (companyId: string, id: string) =>
    [...providerKeys.details(), companyId, id] as const,
}

export function useProviders() {
  const companyId = useCompanyId()

  const query = useQuery({
    queryKey: providerKeys.list(companyId || ''),
    queryFn: () => getProviders(companyId!),
    enabled: !!companyId,
  })

  return {
    providers: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useCreateProvider() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProviderFormData) => createProvider(companyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: providerKeys.list(companyId!),
      })
    },
  })
}

export function useDeleteProvider() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (providerId: string) => deleteProvider(companyId!, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: providerKeys.list(companyId!),
      })
    },
  })
}
