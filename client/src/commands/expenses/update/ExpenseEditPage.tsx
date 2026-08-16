import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useExpenseDetail, useExpenses } from '../../../hooks/useExpenses'
import { getCategoryById } from '../../accounting-categories/shared/categoryService'
import { getCostCenterById } from '../../cost-centers/shared/costCenterService'
import { getProviderById } from '../../providers/shared/providerService'
import type { WizardData } from '../wizard/ExpenseWizard'
import { ExpenseWizard } from '../wizard/ExpenseWizard'

export function ExpenseEditPage() {
  const { expenseId } = useParams<{ expenseId: string }>()
  const companyId = useCompanyId()
  const navigate = useNavigate()
  const { updateExpense, isUpdating } = useExpenses()

  const { data: expense, isLoading: isLoadingExpense } =
    useExpenseDetail(expenseId)

  const { data: provider } = useQuery({
    queryKey: ['provider', companyId, expense?.providerId],
    queryFn: () => getProviderById(companyId!, expense!.providerId),
    enabled: !!companyId && !!expense?.providerId,
  })

  const { data: costCenter } = useQuery({
    queryKey: ['cost-center', companyId, expense?.costCenterId],
    queryFn: () => getCostCenterById(companyId!, expense!.costCenterId),
    enabled: !!companyId && !!expense?.costCenterId,
  })

  const { data: category } = useQuery({
    queryKey: ['category', companyId, expense?.categoryId],
    queryFn: () => getCategoryById(companyId!, expense!.categoryId),
    enabled: !!companyId && !!expense?.categoryId,
  })

  const isLoadingNames = !provider || !costCenter || !category

  const handleSubmit = async (data: WizardData) => {
    const originalIds = new Set((expense?.payments ?? []).map((p) => p.id))
    const remainingIds = new Set(
      data.payments.filter((p) => !p.id.startsWith('temp-')).map((p) => p.id),
    )

    const deletedPaymentIds = [...originalIds].filter(
      (id) => !remainingIds.has(id),
    )

    const newPayments = data.payments
      .filter((p) => p.id.startsWith('temp-'))
      .map((p) => ({
        data: {
          bankAccountId: p.bankAccountId,
          amount: p.amount,
          date: p.date,
          ...(p.notes ? { notes: p.notes } : {}),
        },
        proofFile: p.proofFile || undefined,
      }))

    await updateExpense({
      expenseId: expenseId!,
      data: {
        title: data.title.trim(),
        expenseDate: data.expenseDate,
        providerId: data.providerId.trim(),
        categoryId: data.categoryId.trim(),
        costCenterId: data.costCenterId.trim(),
        subtotal: data.subtotal,
        iva: data.iva,
        ...(data.reteFuente > 0 ? { reteFuente: data.reteFuente } : {}),
        ...(data.reteIca > 0 ? { reteIca: data.reteIca } : {}),
        paymentStatus: data.paymentStatus,
      },
      invoiceFile: data.invoiceFile || undefined,
      paymentsData: newPayments.length > 0 ? newPayments : undefined,
      deletedPaymentIds:
        deletedPaymentIds.length > 0 ? deletedPaymentIds : undefined,
    })

    navigate(`/${companyId}/accountancy/expenses/${expenseId}`, {
      replace: true,
    })
  }

  if (isLoadingExpense || (expense && isLoadingNames)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Gasto no encontrado
        </div>
      </div>
    )
  }

  const initialData: Partial<WizardData> = {
    title: expense.title,
    expenseDate: expense.expenseDate,
    providerId: expense.providerId,
    providerName: provider?.name ?? '',
    categoryId: expense.categoryId,
    accountancyCategoryName: category?.name ?? '',
    costCenterId: expense.costCenterId,
    costCenterName: costCenter?.name ?? '',
    subtotal: expense.subtotal,
    iva: expense.iva,
    reteFuente: expense.reteFuente ?? 0,
    reteIca: expense.reteIca ?? 0,
    payments: expense.payments.map((p) => ({
      id: p.id,
      bankAccountId: p.bankAccountId,
      amount: p.amount,
      date: p.date,
      notes: p.notes ?? '',
      proofFile: null,
      proofUrl: p.proofUrl,
    })),
    invoiceFile: null,
    existingInvoiceUrl: expense.invoiceUrl,
    paymentStatus: expense.paymentStatus,
  }

  return (
    <PageLayout
      title="Actualizar gasto"
      breadcrumbs={[
        { label: 'Inicio', href: `/${companyId}` },
        { label: 'Gastos', href: `/${companyId}/accountancy/expenses` },
        {
          label: expense.title,
          href: `/${companyId}/accountancy/expenses/${expenseId}`,
        },
        { label: 'Actualizar gasto' },
      ]}
    >
      <ExpenseWizard
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />
    </PageLayout>
  )
}
