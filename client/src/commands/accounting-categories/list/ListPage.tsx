import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { ConfirmModal } from '../../../components/ui'
import { Switch } from '../../../components/ui/Switch'
import { useCompanyId } from '../../../hooks/useCompanyId'
import type { AccountingCategory } from '../shared/types'
import { useListCategories } from './useListCategories'

export function ListCategoriesPage() {
  const companyId = useCompanyId()
  const { categories, isLoading, updateCategory, deleteCategory } =
    useListCategories()
  const [editingName, setEditingName] = useState<Record<string, string>>({})
  const [editingDescription, setEditingDescription] = useState<
    Record<string, string>
  >({})
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    name: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleActive = async (category: AccountingCategory) => {
    try {
      await updateCategory({
        categoryId: category.id,
        data: {
          name: category.name,
          description: category.description || '',
          isActive: !category.isActive,
        },
      })
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Error al cambiar estado de categoría',
      )
    }
  }

  const handleNameBlur = async (category: AccountingCategory) => {
    const newName = editingName[category.id]
    if (newName === undefined || newName === category.name) {
      return
    }

    if (!newName.trim()) {
      setEditingName((prev) => {
        const next = { ...prev }
        delete next[category.id]
        return next
      })
      return
    }

    try {
      await updateCategory({
        categoryId: category.id,
        data: {
          name: newName.trim(),
          description: category.description || '',
          isActive: category.isActive,
        },
      })
      setEditingName((prev) => {
        const next = { ...prev }
        delete next[category.id]
        return next
      })
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Error al actualizar categoría',
      )
      setEditingName((prev) => {
        const next = { ...prev }
        delete next[category.id]
        return next
      })
    }
  }

  const handleDescriptionBlur = async (category: AccountingCategory) => {
    const newDescription = editingDescription[category.id]
    if (newDescription === undefined) {
      return
    }

    const currentDescription = category.description || ''
    if (newDescription === currentDescription) {
      setEditingDescription((prev) => {
        const next = { ...prev }
        delete next[category.id]
        return next
      })
      return
    }

    try {
      await updateCategory({
        categoryId: category.id,
        data: {
          name: category.name,
          description: newDescription.trim(),
          isActive: category.isActive,
        },
      })
      setEditingDescription((prev) => {
        const next = { ...prev }
        delete next[category.id]
        return next
      })
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Error al actualizar categoría',
      )
      setEditingDescription((prev) => {
        const next = { ...prev }
        delete next[category.id]
        return next
      })
    }
  }

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await deleteCategory(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Error al eliminar categoría. Puede que tenga gastos asociados.',
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
    <PageLayout
      maxWidth="6xl"
      title="Categorías contables"
      subtitle={`${categories.length} categoría${categories.length !== 1 ? 's' : ''} registrada${categories.length !== 1 ? 's' : ''}`}
      actions={
        <Link
          to={`/${companyId}/accountancy/categories/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Link>
      }
    >
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      {categories.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">
            No hay categorías registradas. Usa{' '}
            <code className="px-2 py-1 bg-gray-100 rounded text-sm">
              /crear-categoria-contable
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={
                        editingName[category.id] !== undefined
                          ? editingName[category.id]
                          : category.name
                      }
                      onChange={(e) =>
                        setEditingName((prev) => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      onBlur={() => handleNameBlur(category)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                      }}
                      className="w-full px-2 py-1 text-sm font-medium text-gray-900 border border-transparent rounded hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={
                        editingDescription[category.id] !== undefined
                          ? editingDescription[category.id]
                          : category.description || ''
                      }
                      onChange={(e) =>
                        setEditingDescription((prev) => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      onBlur={() => handleDescriptionBlur(category)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                      }}
                      placeholder="Descripción (opcional)"
                      className="w-full px-2 py-1 text-sm text-gray-500 border border-transparent rounded hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={() => toggleActive(category)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteClick(category.id, category.name)
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
    </PageLayout>
  )
}
