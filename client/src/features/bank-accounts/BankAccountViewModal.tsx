import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, ConfirmModal, SlidePanel } from '../../components/ui'
import { useAuth } from '../../features/auth/AuthContext'
import {
  bankAccountKeys,
  getBankAccount,
  useBankAccounts,
} from '../../hooks/useBankAccounts'
import { useCompanyId } from '../../hooks/useCompanyId'

interface Props {
  accountId: string
}

export function BankAccountViewModal({ accountId }: Props) {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const { uploadStatement, deleteStatement, isUploadingStatement } =
    useBankAccounts()

  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: account, isLoading } = useQuery({
    queryKey: bankAccountKeys.detail(companyId || '', accountId),
    queryFn: () => getBankAccount(companyId!, accountId),
    enabled: !!companyId && !!accountId,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Solo se permiten archivos PDF')
      e.target.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedMonth || !selectedFile || !user) {
      alert('Selecciona un mes y un archivo')
      return
    }

    setIsUploading(true)
    try {
      await uploadStatement(accountId, selectedMonth, selectedFile, user.id)
      setSelectedMonth('')
      setSelectedFile(null)
      // Reset file input
      const fileInput = document.getElementById(
        'statement-file',
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Error al subir extracto bancario',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteClick = (month: string) => {
    setDeleteConfirm(month)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await deleteStatement(accountId, deleteConfirm)
      setDeleteConfirm(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar extracto')
    } finally {
      setIsDeleting(false)
    }
  }

  const editUrl = (() => {
    const params = new URLSearchParams(searchParams)
    params.set('mode', 'update')
    return `?${params.toString()}`
  })()

  if (isLoading) {
    return (
      <SlidePanel title="Detalle de cuenta bancaria">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </SlidePanel>
    )
  }

  if (!account) {
    return (
      <SlidePanel title="Detalle de cuenta bancaria">
        <div className="text-center py-12 text-gray-500">
          Cuenta bancaria no encontrada
        </div>
      </SlidePanel>
    )
  }

  const statements = account.statements || []

  return (
    <>
      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar extracto"
        message={`¿Estás seguro de que deseas eliminar el extracto de ${deleteConfirm}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      <SlidePanel title="Detalle de cuenta bancaria">
        <div className="space-y-6">
          {/* Account Info */}
          <div>
            <div className="text-xs text-gray-500 font-medium normal-case mb-1">
              Nombre
            </div>
            <div className="text-sm text-gray-900">{account.name}</div>
          </div>

          {/* Upload Statement */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Subir extracto bancario
            </h3>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="statement-month"
                  className="block text-xs text-gray-500 font-medium normal-case mb-1"
                >
                  Mes
                </label>
                <input
                  id="statement-month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="statement-file"
                  className="block text-xs text-gray-500 font-medium normal-case mb-1"
                >
                  Archivo PDF
                </label>
                <input
                  id="statement-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={
                  !selectedMonth || !selectedFile || isUploadingStatement
                }
                isLoading={isUploading}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Extracto
              </Button>
            </div>
          </div>

          {/* Statements List */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Extractos ({statements.length})
            </h3>

            {statements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay extractos subidos
              </p>
            ) : (
              <div className="space-y-2">
                {statements.map((statement) => (
                  <div
                    key={statement.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {statement.month}
                        </div>
                        <div className="text-xs text-gray-500">
                          {statement.fileName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={statement.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(statement.month)}
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Link to={editUrl}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
          </div>
        </div>
      </SlidePanel>
    </>
  )
}
