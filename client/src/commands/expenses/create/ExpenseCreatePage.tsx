import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useExpenses } from '../../../hooks/useExpenses'
import type { WizardData } from '../wizard/ExpenseWizard'
import { ExpenseWizard } from '../wizard/ExpenseWizard'

export function ExpenseCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createExpense, isCreating } = useExpenses()

  const handleSubmit = async (data: WizardData) => {
    // Prepare payments data
    const paymentsData =
      data.payments.length > 0
        ? data.payments.map((payment) => ({
            data: {
              amount: payment.amount,
              bankAccountId: payment.bankAccountId,
              date: payment.date,
              notes: payment.notes,
            },
            proofFile: payment.proofFile || undefined,
          }))
        : undefined

    // Create expense with invoice and payments in one server call
    await createExpense({
      data: {
        title: data.title.trim(),
        expenseDate: data.expenseDate,
        providerId: data.providerId.trim(),
        categoryId: data.categoryId.trim(),
        costCenterId: data.costCenterId.trim(),
        subtotal: data.subtotal,
        iva: data.iva,
        reteFuente: data.reteFuente || undefined,
        reteIca: data.reteIca || undefined,
        paymentStatus: data.paymentStatus,
      },
      invoiceFile: data.invoiceFile || undefined,
      paymentsData,
    })

    navigate(`/${companyId}/accountancy/expenses`, { replace: true })
  }

  return (
    <PageLayout title="Registrar gasto">
      <ExpenseWizard
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
      />
    </PageLayout>
  )
}
