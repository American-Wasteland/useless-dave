import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmModal } from '../../../components/ui'
import { useBankAccounts } from '../../../hooks/useBankAccounts'
import { useCompanyId } from '../../../hooks/useCompanyId'

export function ListBankAccountsPage() {
  const companyId = useCompanyId()
  const { bankAccounts, isLoading, deleteBankAccount } = useBankAccounts()
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    name: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await deleteBankAccount(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Error al eliminar cuenta bancaria.',
      )
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

  return (
    <>
      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar cuenta bancaria"
        message={`¿Estás seguro de que deseas eliminar la cuenta "${deleteConfirm?.name}"? Todos los extractos asociados serán eliminados. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cuentas bancarias
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {bankAccounts.length} cuenta
              {bankAccounts.length !== 1 ? 's' : ''} registrada
              {bankAccounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to={`/${companyId}/accountancy/bank-accounts/create`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Nueva cuenta
          </Link>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500">
              No hay cuentas bancarias registradas. Usa{' '}
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                /crear-cuenta-bancaria
              </code>{' '}
              para crear una.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extractos
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bankAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/${companyId}/accountancy/bank-accounts/${account.id}`}
                        className="text-sm font-medium text-gray-900 before:absolute before:inset-0"
                      >
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                        <FileText className="h-4 w-4" />
                        <span>{account.statements?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 relative z-10">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/${companyId}/accountancy/bank-accounts/${account.id}/edit`}
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(account.id, account.name)
                          }
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
