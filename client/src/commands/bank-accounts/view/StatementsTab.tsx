import { useQueryClient } from '@tanstack/react-query'
import { Eye, FileText, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { Button, ConfirmModal } from '../../../components/ui'
import {
  bankAccountKeys,
  useBankAccounts,
} from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'
import type { BankAccount } from '../shared/types'

function formatMonth(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export function StatementsTab() {
  const { account } = useOutletContext<{ account: BankAccount }>()
  const { accountId } = useParams<{ accountId: string }>()
  const companyId = useCompanyId()
  const queryClient = useQueryClient()
  const { deleteStatement } = useBankAccounts()

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const statements = account.statements || []

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

  return (
    <>
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar extracto"
        message={`¿Estás seguro de que deseas eliminar el extracto de ${deleteConfirm ? formatMonth(deleteConfirm) : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="flex justify-end mb-4">
        <Link
          to={`/${companyId}/accountancy/bank-accounts/${accountId}/statements/upload`}
        >
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar extracto
          </Button>
        </Link>
      </div>

      {statements.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No hay extractos subidos</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {statements.map((statement) => (
            <div
              key={statement.id}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatMonth(statement.month)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {statement.fileName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={statement.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver extracto"
                >
                  <Eye className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(statement.month)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
