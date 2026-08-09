import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Download,
  FileText,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, ConfirmModal } from '../../../components/ui'
import { useAuth } from '../../../features/auth/AuthContext'
import {
  bankAccountKeys,
  getBankAccount,
  useBankAccounts,
} from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'

export function BankAccountViewPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const companyId = useCompanyId()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { uploadStatement, deleteStatement } = useBankAccounts()

  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: account, isLoading } = useQuery({
    queryKey: bankAccountKeys.detail(companyId || '', accountId || ''),
    queryFn: () => getBankAccount(companyId!, accountId!),
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
    if (!selectedMonth || !selectedFile || !user || !accountId) {
      alert('Selecciona un mes y un archivo')
      return
    }

    setIsUploading(true)
    try {
      await uploadStatement(accountId, selectedMonth, selectedFile, user.id)
      setSelectedMonth('')
      setSelectedFile(null)
      const fileInput = document.getElementById(
        'statement-file',
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ''
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.detail(companyId || '', accountId),
      })
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Error al subir extracto bancario',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !accountId) return
    setIsDeleting(true)
    try {
      await deleteStatement(accountId, deleteConfirm)
      setDeleteConfirm(null)
      queryClient.invalidateQueries({
        queryKey: bankAccountKeys.detail(companyId || '', accountId),
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar extracto')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Cuenta bancaria no encontrada
        </div>
      </div>
    )
  }

  const statements = account.statements || []

  return (
    <>
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

      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to={`/${companyId}/accountancy/bank-accounts`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <Link
            to={`/${companyId}/accountancy/bank-accounts/${accountId}/edit`}
          >
            <Button variant="secondary">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>

        <div className="card p-6 space-y-6">
          {/* Account name */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
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
                disabled={!selectedMonth || !selectedFile}
                isLoading={isUploading}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir extracto
              </Button>
            </div>
          </div>

          {/* Statements list */}
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
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(statement.month)}
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
        </div>
      </div>
    </>
  )
}
