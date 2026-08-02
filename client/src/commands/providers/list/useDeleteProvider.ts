import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { deleteProvider as deleteProviderService } from '../shared/providerService'
import { providerKeys } from '../shared/queryKeys'

export function useDeleteProvider() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (providerId: string) =>
      deleteProviderService(companyId!, providerId),
    onSuccess: () => {
      // Invalidate provider list queries
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })

  return {
    deleteProvider: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}
