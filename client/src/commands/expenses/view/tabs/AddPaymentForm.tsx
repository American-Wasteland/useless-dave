import { FileText, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, Modal, SearchableSelect } from '../../../../components/ui'
import { useBankAccounts } from '../../../../hooks/useBankAccounts'
import type { AddPaymentInput } from '../../shared/types'

interface AddPaymentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddPaymentInput, proofFile?: File) => Promise<void>
  isSubmitting: boolean
}

export function AddPaymentForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddPaymentFormProps) {
  const { bankAccounts } = useBankAccounts()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<AddPaymentInput>({
    bankAccountId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.bankAccountId) {
      setError('Selecciona una cuenta bancaria')
      return
    }
    if (formData.amount <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }
    if (!formData.date) {
      setError('La fecha es requerida')
      return
    }

    try {
      await onSubmit(formData, proofFile || undefined)
      // Reset form
      setFormData({
        bankAccountId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      setProofFile(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar pago')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Amount */}
        <div>
          <label
            htmlFor="payment-amount"
            className="text-xs text-gray-500 font-medium normal-case block mb-1"
          >
            Monto
          </label>
          <input
            id="payment-amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) =>
              setFormData({ ...formData, amount: Number(e.target.value) })
            }
            placeholder="0"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            required
          />
        </div>

        {/* Bank Account */}
        <SearchableSelect
          label="Cuenta bancaria"
          value={formData.bankAccountId}
          onChange={(value) =>
            setFormData({ ...formData, bankAccountId: value })
          }
          options={bankAccountOptions}
          placeholder="Seleccionar cuenta..."
        />

        {/* Date */}
        <div>
          <label
            htmlFor="payment-date"
            className="text-xs text-gray-500 font-medium normal-case block mb-1"
          >
            Fecha de pago
          </label>
          <input
            id="payment-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="payment-notes"
            className="text-xs text-gray-500 font-medium normal-case block mb-1"
          >
            Notas <span className="text-gray-400 font-normal">- Opcional</span>
          </label>
          <textarea
            id="payment-notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Observaciones sobre el pago"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
          />
        </div>

        {/* Proof PDF or Image */}
        <div>
          <label
            htmlFor="payment-proof"
            className="text-xs text-gray-500 font-medium normal-case block mb-2"
          >
            Comprobante de pago{' '}
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
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">
                Click para seleccionar archivo
              </p>
              <p className="text-xs text-gray-500">
                PDF o imagen (JPG, PNG, WebP) - máx 10MB
              </p>
              <input
                id="payment-proof"
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-3 flex items-center justify-between">
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

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <div className="flex-1" />
          <Button type="submit" isLoading={isSubmitting}>
            Agregar pago
          </Button>
        </div>
      </form>
    </Modal>
  )
}
