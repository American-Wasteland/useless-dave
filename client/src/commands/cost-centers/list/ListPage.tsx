import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmModal } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCostCenters } from '../../../hooks/useCostCenters'

export function ListCostCentersPage() {
  const companyId = useCompanyId()
  const { costCenters, isLoading, deleteCostCenter } = useCostCenters()
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
      await deleteCostCenter(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Error al eliminar centro de costo. Puede que tenga gastos asociados.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: '🟢 Activo',
      completed: '✅ Completado',
      cancelled: '❌ Cancelado',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getTypeLabel = (type: string) => {
    return type === 'project' ? '📁 Proyecto' : '⚙️ Operación'
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
        title="Eliminar centro de costo"
        message={`¿Estás seguro de que deseas eliminar el centro de costo "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Centros de Costo</h1>
          <p className="text-sm text-gray-500 mt-1">
            {costCenters.length} centro{costCenters.length !== 1 ? 's' : ''} de
            costo registrado{costCenters.length !== 1 ? 's' : ''}
          </p>
        </div>

        {costCenters.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500">
              No hay centros de costo registrados. Usa{' '}
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                /crear-centro-costo
              </code>{' '}
              para crear uno.
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costCenters.map((costCenter) => (
                  <tr
                    key={costCenter.id}
                    className="hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/${companyId}/accountancy/cost-centers?modal=costCenter&mode=view&id=${costCenter.id}`}
                        className="text-sm font-medium text-gray-900 before:absolute before:inset-0"
                      >
                        {costCenter.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getTypeLabel(costCenter.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getStatusLabel(costCenter.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {costCenter.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm relative z-10">
                      <Link
                        to={`/${companyId}/accountancy/cost-centers?modal=costCenter&mode=update&id=${costCenter.id}`}
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(costCenter.id, costCenter.name)
                        }
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
