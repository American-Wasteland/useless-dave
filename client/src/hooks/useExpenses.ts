import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import * as expenseService from '../commands/expenses/shared/expenseService'
import type {
  AddPaymentInput,
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '../commands/expenses/shared/types'
import { useCompanyId } from './useCompanyId'

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (companyId: string, from?: string, to?: string, search?: string) =>
    [
      ...expenseKeys.lists(),
      companyId,
      from ?? '',
      to ?? '',
      search ?? '',
    ] as const,
  detail: (companyId: string, id: string) =>
    [...expenseKeys.all, 'detail', companyId, id] as const,
}

export async function getExpense(
  companyId: string,
  expenseId: string,
): Promise<Expense | null> {
  try {
    return await expenseService.getExpenseById(companyId, expenseId)
  } catch (_error) {
    return null
  }
}

export function useExpenses(options?: {
  from?: string
  to?: string
  search?: string
}) {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: expenseKeys.list(
      companyId || '',
      options?.from,
      options?.to,
      options?.search,
    ),
    queryFn: () => expenseService.getExpenses(companyId!, options),
    enabled: !!companyId,
    placeholderData: keepPreviousData,
  })

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      invoiceFile,
      paymentsData,
    }: {
      data: CreateExpenseInput
      invoiceFile?: File
      paymentsData?: Array<{
        data: AddPaymentInput
        proofFile?: File
      }>
    }) => {
      return expenseService.createExpense(
        companyId!,
        data,
        invoiceFile,
        paymentsData,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.lists(),
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      expenseId,
      data,
      invoiceFile,
      paymentsData,
      deletedPaymentIds,
    }: {
      expenseId: string
      data: UpdateExpenseInput
      invoiceFile?: File
      paymentsData?: Array<{ data: AddPaymentInput; proofFile?: File }>
      deletedPaymentIds?: string[]
    }) => {
      return expenseService.updateExpense(
        companyId!,
        expenseId,
        data,
        invoiceFile,
        paymentsData,
        deletedPaymentIds,
      )
    },
    onMutate: async ({ expenseId, data }) => {
      const listKey = expenseKeys.list(
        companyId!,
        dateRange?.from,
        dateRange?.to,
      )
      const detailKey = expenseKeys.detail(companyId!, expenseId)

      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: detailKey })

      const previousList = queryClient.getQueryData<Expense[]>(listKey)
      const previousDetail = queryClient.getQueryData<Expense>(detailKey)

      // Optimistic update for list
      queryClient.setQueryData<Expense[]>(listKey, (old) =>
        old?.map((exp) => (exp.id === expenseId ? { ...exp, ...data } : exp)),
      )

      // Optimistic update for detail
      queryClient.setQueryData<Expense>(detailKey, (old) =>
        old ? { ...old, ...data } : old,
      )

      return { previousList, previousDetail }
    },
    onSuccess: (updatedExpense, { expenseId }) => {
      queryClient.setQueryData(
        expenseKeys.detail(companyId!, expenseId),
        updatedExpense,
      )
      queryClient.setQueryData<Expense[]>(
        expenseKeys.list(companyId!, options?.from, options?.to),
        (old) =>
          old?.map((exp) => (exp.id === expenseId ? updatedExpense : exp)),
      )
    },
    onError: (_err, { expenseId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          expenseKeys.list(companyId!, options?.from, options?.to),
          context.previousList,
        )
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          expenseKeys.detail(companyId!, expenseId),
          context.previousDetail,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      return expenseService.deleteExpense(companyId!, expenseId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.lists(),
      })
    },
  })

  return {
    expenses: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    deleteExpense: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useExpenseDetail(expenseId: string | undefined) {
  const companyId = useCompanyId()

  return useQuery({
    queryKey: expenseKeys.detail(companyId || '', expenseId || ''),
    queryFn: () => expenseService.getExpenseById(companyId!, expenseId!),
    enabled: !!companyId && !!expenseId,
  })
}

export function useExpensePayments(expenseId: string) {
  const companyId = useCompanyId()
  const queryClient = useQueryClient()

  const addPaymentMutation = useMutation({
    mutationFn: async ({
      data,
      proofFile,
    }: {
      data: AddPaymentInput
      proofFile?: File
    }) => {
      return expenseService.addPayment(companyId!, expenseId, data, proofFile)
    },
    onSuccess: (updatedExpense) => {
      // Update detail cache with full response
      queryClient.setQueryData(
        expenseKeys.detail(companyId!, expenseId),
        updatedExpense,
      )
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: expenseKeys.list(companyId!),
      })
    },
  })

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return expenseService.deletePayment(companyId!, expenseId, paymentId)
    },
    onSuccess: (updatedExpense) => {
      // Update detail cache
      queryClient.setQueryData(
        expenseKeys.detail(companyId!, expenseId),
        updatedExpense,
      )
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: expenseKeys.list(companyId!),
      })
    },
  })

  return {
    addPayment: addPaymentMutation.mutateAsync,
    deletePayment: deletePaymentMutation.mutateAsync,
    isAddingPayment: addPaymentMutation.isPending,
    isDeletingPayment: deletePaymentMutation.isPending,
  }
}
