import { FileText, Upload, X } from 'lucide-react'
import { useRef } from 'react'

interface StepInvoiceProps {
  invoiceFile: File | null
  onUpdate: (data: { invoiceFile: File | null }) => void
}

export function StepInvoice({ invoiceFile, onUpdate }: StepInvoiceProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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
      onUpdate({ invoiceFile: file })
    } else if (file) {
      alert('Solo se permiten archivos PDF o imágenes (JPG, PNG, WebP)')
      e.target.value = ''
    }
  }

  const handleRemove = () => {
    onUpdate({ invoiceFile: null })
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="expense-invoice"
          className="text-xs text-gray-500 font-medium normal-case block mb-2"
        >
          Factura o cuenta de cobro{' '}
          <span className="text-gray-400 font-normal">- Opcional</span>
        </label>

        {!invoiceFile ? (
          // biome-ignore lint/a11y/useSemanticElements: div intentionally styled as file drop zone
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Click para seleccionar archivo
            </p>
            <p className="text-xs text-gray-500">
              PDF o imagen (JPG, PNG, WebP) - máx 10MB. Puedes agregarlo
              después.
            </p>
            <input
              id="expense-invoice"
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {invoiceFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(invoiceFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
