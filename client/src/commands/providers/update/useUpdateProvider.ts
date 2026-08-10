import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Provider } from '@useless-dave/shared'
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

    onMutate: async ({ providerId, data }) => {
      const key = providerKeys.detail(companyId!, providerId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Provider>(key)
      queryClient.setQueryData<Provider>(key, (old) => {
        if (!old) return old
        return {
          ...old,
          ...(data.name !== undefined && { name: data.name }),
          ...(data.nit !== undefined && { nit: data.nit }),
          ...(data.providerType !== undefined && { providerType: data.providerType }),
          ...(data.contactName !== undefined && { contactName: data.contactName }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        }
      })
      return { previous, providerId }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          providerKeys.detail(companyId!, context.providerId),
          context.previous,
        )
      }
    },

    onSettled: (_data, _err, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(companyId!, providerId) })
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })

  return {
    updateProvider: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}
