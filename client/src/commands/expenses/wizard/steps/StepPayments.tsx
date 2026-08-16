import { FileText, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, Currency, SearchableSelect } from '../../../../components/ui'
import { useBankAccounts } from '../../../../hooks/useBankAccounts'

export interface PaymentData {
  id: string
  amount: number
  bankAccountId: string
  date: string
  notes: string
  proofFile: File | null
}

interface StepPaymentsProps {
  payments: PaymentData[]
  onUpdate: (data: { payments: PaymentData[] }) => void
}

export function StepPayments({ payments, onUpdate }: StepPaymentsProps) {
  const { bankAccounts } = useBankAccounts()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddPayment = (payment: Omit<PaymentData, 'id'>) => {
    const newPayment: PaymentData = {
      ...payment,
      id: `temp-${Date.now()}-${Math.random()}`,
    }
    onUpdate({ payments: [...payments, newPayment] })
    setIsAdding(false)
  }

  const handleRemovePayment = (id: string) => {
    onUpdate({ payments: payments.filter((p) => p.id !== id) })
  }

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-500 font-medium normal-case block mb-2">
          Pagos realizados{' '}
          <span className="text-gray-400 font-normal">- Opcional</span>
        </div>

        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar pago
          </Button>
        )}
      </div>

      {isAdding && (
        <AddPaymentInline
          bankAccounts={bankAccounts}
          onAdd={handleAddPayment}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {sortedPayments.length > 0 && (
        <div className="space-y-3">
          {sortedPayments.map((payment) => (
            <div key={payment.id} className="card p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      <Currency amount={payment.amount} />
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(payment.date).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Cuenta:{' '}
                      <span className="text-gray-700">
                        {bankAccounts.find(
                          (a) => a.id === payment.bankAccountId,
                        )?.name || payment.bankAccountId}
                      </span>
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-gray-600 italic">
                        {payment.notes}
                      </p>
                    )}
                    {payment.proofFile && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="h-3 w-3" />
                        <span>{payment.proofFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePayment(payment.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface AddPaymentInlineProps {
  bankAccounts: Array<{ id: string; name: string }>
  onAdd: (payment: Omit<PaymentData, 'id'>) => void
  onCancel: () => void
}

function AddPaymentInline({
  bankAccounts,
  onAdd,
  onCancel,
}: AddPaymentInlineProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState<number>(0)
  const [bankAccountId, setBankAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const bankAccountOptions = bankAccounts.map((account) => ({
    value: account.id,
    label: account.name,
  }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]
    if (file && allowedTypes.includes(file.type)) {
      setProofFile(file)
      setError(null)
    } else if (file) {
      setError('Solo se permiten archivos PDF o imágenes (JPG, PNG, WebP)')
      e.target.value = ''
    }
  }

  const handleRemoveFile = () => {
    setProofFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAdd = () => {
    if (amount <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }
    if (!bankAccountId) {
      setError('Selecciona una cuenta bancaria')
      return
    }
    if (!date) {
      setError('La fecha es requerida')
      return
    }

    onAdd({
      amount,
      bankAccountId,
      date,
      notes,
      proofFile,
    })
  }

  return (
    <div className="border-2 border-dashed border-primary rounded-lg p-4 space-y-4 bg-blue-50/30">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Amount */}
      <div>
        <label
          htmlFor="inline-payment-amount"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          Monto
        </label>
        <input
          id="inline-payment-amount"
          type="number"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="0"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Bank Account */}
      <SearchableSelect
        label="Cuenta bancaria"
        value={bankAccountId}
        onChange={(value) => setBankAccountId(value)}
        options={bankAccountOptions}
        placeholder="Seleccionar cuenta..."
      />

      {/* Date */}
      <div>
        <label
          htmlFor="inline-payment-date"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          Fecha de pago
        </label>
        <input
          id="inline-payment-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Proof PDF or Image */}
      <div>
        <label
          htmlFor="inline-payment-proof"
          className="text-xs text-gray-500 font-medium normal-case block mb-2"
        >
          Comprobante{' '}
          <span className="text-gray-400 font-normal">- Opcional</span>
        </label>

        {!proofFile ? (
          // biome-ignore lint/a11y/useSemanticElements: div intentionally styled as file drop zone
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-white transition-colors"
          >
            <FileText className="h-6 w-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600">
              Click para seleccionar archivo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF o imagen (JPG, PNG, WebP)
            </p>
            <input
              id="inline-payment-proof"
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {proofFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="inline-payment-notes"
          className="text-xs text-gray-500 font-medium normal-case block mb-1"
        >
          Notas <span className="text-gray-400 font-normal">- Opcional</span>
        </label>
        <textarea
          id="inline-payment-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones sobre el pago"
          rows={5}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={handleAdd}>
          Agregar
        </Button>
      </div>
    </div>
  )
}
