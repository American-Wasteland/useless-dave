import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { updateProvider as updateProviderService } from '../shared/providerService'
import { providerKeys } from '../shared/queryKeys'
import type { UpdateProviderInput } from '../shared/types'

export function useUpdateProvider() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      providerId,
      data,
      files,
    }: {
      providerId: string
      data: UpdateProviderInput
      files?: { rut?: File; bankAccount?: File }
    }) => updateProviderService(companyId!, providerId, data, files),
    onSuccess: () => {
      // Invalidate provider list and detail queries
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: providerKeys.details() })
    },
  })

  return {
    updateProvider: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}
