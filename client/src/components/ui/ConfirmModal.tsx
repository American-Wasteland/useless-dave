import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {/* Icon + Message */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              variant === 'danger' ? 'bg-red-50' : 'bg-yellow-50'
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                variant === 'danger' ? 'text-red-600' : 'text-yellow-600'
              }`}
            />
          </div>
          <p className="text-sm text-muted-foreground flex-1">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            isLoading={isLoading}
            className={`flex-1 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : ''
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
