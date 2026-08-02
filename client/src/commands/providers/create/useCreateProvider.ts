import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { createProvider } from '../shared/providerService'
import { providerKeys } from '../shared/queryKeys'
import type { CreateProviderInput } from '../shared/types'

export function useCreateProvider() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: CreateProviderInput
      files?: { rut?: File; bankAccount?: File }
    }) => createProvider(companyId!, data, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: providerKeys.list(companyId!),
      })
    },
  })

  return {
    createProvider: (
      data: CreateProviderInput,
      files?: { rut?: File; bankAccount?: File },
    ) => mutation.mutateAsync({ data, files }),
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}
