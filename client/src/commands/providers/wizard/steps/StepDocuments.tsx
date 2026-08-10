import { Eye, FileText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmModal, FileUpload } from '../../../../components/ui'
import type { WizardData } from '../ProviderWizard'

interface StepDocumentsProps {
  data: WizardData
  onChange: (patch: Partial<WizardData>) => void
  mode: 'create' | 'edit'
  existingRutUrl?: string
  existingBankAccountUrl?: string
  onDeleteDocument?: (doc: 'rut' | 'bankAccount') => Promise<void>
}

export function StepDocuments({
  data,
  onChange,
  mode,
  existingRutUrl,
  existingBankAccountUrl,
  onDeleteDocument,
}: StepDocumentsProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<'rut' | 'bankAccount' | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !onDeleteDocument) return
    setIsDeleting(true)
    try {
      await onDeleteDocument(deleteConfirm)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar documento"
        message={`¿Estás seguro de que deseas eliminar el ${
          deleteConfirm === 'rut' ? 'RUT' : 'Certificación bancaria'
        }? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Documentos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Adjunta los documentos del proveedor (opcional)
          </p>
        </div>

        <DocumentSlot
          label="RUT"
          existingUrl={mode === 'edit' ? existingRutUrl : undefined}
          file={data.rutFile}
          onFileChange={(f) => onChange({ rutFile: f })}
          onDelete={() => setDeleteConfirm('rut')}
        />

        <DocumentSlot
          label="Certificación bancaria"
          existingUrl={mode === 'edit' ? existingBankAccountUrl : undefined}
          file={data.bankAccountFile}
          onFileChange={(f) => onChange({ bankAccountFile: f })}
          onDelete={() => setDeleteConfirm('bankAccount')}
        />
      </div>
    </>
  )
}

interface DocumentSlotProps {
  label: string
  existingUrl?: string
  file: File | null
  onFileChange: (f: File | null) => void
  onDelete: () => void
}

function DocumentSlot({ label, existingUrl, file, onFileChange, onDelete }: DocumentSlotProps) {
  return (
    <div className="p-4 bg-muted rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        {existingUrl && (
          <div className="flex items-center gap-1">
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver documento"
            >
              <Eye className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {!existingUrl && (
        <FileUpload
          accept=".pdf"
          value={file}
          onChange={onFileChange}
          error={file && file.type !== 'application/pdf' ? 'Solo archivos PDF' : undefined}
        />
      )}
    </div>
  )
}
