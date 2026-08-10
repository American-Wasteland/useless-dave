import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as costCenterService from '../commands/cost-centers/shared/costCenterService'
import type {
  CostCenter,
  CreateCostCenterInput,
  UpdateCostCenterInput,
} from '../commands/cost-centers/shared/types'
import { useCompanyId } from './useCompanyId'

export const costCenterKeys = {
  all: ['costCenters'] as const,
  lists: () => [...costCenterKeys.all, 'list'] as const,
  list: (companyId: string) => [...costCenterKeys.lists(), companyId] as const,
  detail: (companyId: string, id: string) =>
    [...costCenterKeys.all, 'detail', companyId, id] as const,
}

export async function getCostCenter(
  companyId: string,
  costCenterId: string,
): Promise<CostCenter | null> {
  try {
    return await costCenterService.getCostCenterById(companyId, costCenterId)
  } catch (_error) {
    return null
  }
}

export function useCostCenters() {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: costCenterKeys.list(companyId || ''),
    queryFn: () => costCenterService.getCostCenters(companyId!),
    enabled: !!companyId,
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateCostCenterInput) => {
      return costCenterService.createCostCenter(companyId!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: costCenterKeys.list(companyId!),
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      costCenterId,
      data,
    }: {
      costCenterId: string
      data: UpdateCostCenterInput
    }) => {
      return costCenterService.updateCostCenter(companyId!, costCenterId, data)
    },
    onMutate: async ({ costCenterId, data }) => {
      const key = costCenterKeys.list(companyId!)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<CostCenter[]>(key)
      queryClient.setQueryData<CostCenter[]>(key, (old) =>
        old?.map((cc) => (cc.id === costCenterId ? { ...cc, ...data } : cc)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          costCenterKeys.list(companyId!),
          context.previous,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: costCenterKeys.list(companyId!),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (costCenterId: string) => {
      return costCenterService.deleteCostCenter(companyId!, costCenterId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: costCenterKeys.list(companyId!),
      })
    },
  })

  const createCostCenter = async (data: CreateCostCenterInput) => {
    await createMutation.mutateAsync(data)
  }

  const updateCostCenter = async (
    costCenterId: string,
    data: UpdateCostCenterInput,
  ) => {
    await updateMutation.mutateAsync({ costCenterId, data })
  }

  const deleteCostCenter = async (costCenterId: string) => {
    await deleteMutation.mutateAsync(costCenterId)
  }

  return {
    costCenters: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
