import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  Currency,
  FileUpload,
  Input,
  Modal,
  Select,
} from '../../components/ui'
import { usePaymentAccounts } from '../../hooks/usePaymentAccounts'
import { formatCurrency, formatDateInput } from '../../lib/utils'
import type { PaymentFormData } from '../../types'
import { createPayment } from './expenseService'

interface PaymentFormProps {
  expenseId: string
  maxAmount: number
  onClose: () => void
  onSuccess: () => void
}

export function PaymentForm({
  expenseId,
  maxAmount,
  onClose,
  onSuccess,
}: PaymentFormProps) {
  const { companyId } = useParams<{ companyId: string }>()
  const { paymentAccounts } = usePaymentAccounts()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: maxAmount,
    paymentAccountId: '',
    date: formatDateInput(new Date()),
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof PaymentFormData, string>>
  >({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentFormData, string>> = {}

    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = 'Ingresa un monto válido'
    if (formData.amount > maxAmount)
      newErrors.amount = `El monto máximo es ${formatCurrency(maxAmount)}`
    if (!formData.paymentAccountId)
      newErrors.paymentAccountId = 'Selecciona una cuenta'
    if (!formData.date) newErrors.date = 'Selecciona una fecha'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !companyId) return

    setIsLoading(true)
    try {
      await createPayment(companyId, expenseId, formData)
      onSuccess()
    } catch (error) {
      console.error('Error creating payment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Registrar Pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Monto pendiente</p>
          <p className="text-lg font-semibold text-gray-900">
            <Currency amount={maxAmount} />
          </p>
        </div>

        <Input
          id="amount"
          label="Monto a pagar (Currency)"
          type="number"
          value={formData.amount || ''}
          onChange={(e) =>
            setFormData({ ...formData, amount: Number(e.target.value) })
          }
          error={errors.amount}
        />

        <Select
          id="paymentAccount"
          label="Cuenta de Pago"
          value={formData.paymentAccountId}
          onChange={(e) =>
            setFormData({ ...formData, paymentAccountId: e.target.value })
          }
          options={paymentAccounts.map((a) => ({ value: a.id, label: a.name }))}
          placeholder="Seleccionar cuenta"
          error={errors.paymentAccountId}
        />

        <Input
          id="date"
          label="Fecha"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date}
        />

        <Input
          id="notes"
          label="Notas"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <FileUpload
          label="Comprobante"
          value={formData.voucherFile}
          onChange={(file) =>
            setFormData({ ...formData, voucherFile: file || undefined })
          }
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Registrar Pago
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
