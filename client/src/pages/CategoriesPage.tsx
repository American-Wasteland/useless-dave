import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Modal } from '../components/ui'
import { useAccountingCategories } from '../features/categories/useCategories'
import type { Category } from '../types'

interface CategoriesPageProps {
  hideHeader?: boolean
}

export function CategoriesPage({ hideHeader = false }: CategoriesPageProps) {
  const { t } = useTranslation()
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
  } = useAccountingCategories()

  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    setEditingCategory(null)
    setName('')
    setDescription('')
    setError(null)
    setShowModal(true)
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description || '')
    setError(null)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setError(null)
    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory.id,
          data: { name, description: description || undefined },
        })
      } else {
        await createCategory({ name, description: description || undefined })
      }
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(t('common.confirmDelete', { name: category.name }))) return

    try {
      await deleteCategory(category.id)
    } catch {
      alert(t('accountingCategories.deleteError'))
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
    <div>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('accountingCategories.title')}
          </h1>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t('accountingCategories.new')}
          </Button>
        </div>
      )}

      {hideHeader && (
        <div className="flex justify-end mb-4">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t('accountingCategories.new')}
          </Button>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="card p-8 text-center">
          <Tags className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('accountingCategories.empty')}
          </h3>
          <p className="text-gray-500 mb-4">
            {t('accountingCategories.emptyDescription')}
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t('accountingCategories.new')}
          </Button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('common.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('common.description')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg mr-1"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingCategory ? t('common.edit') : t('accountingCategories.new')
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          <Input
            id="name"
            label={t('common.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Input
            id="description"
            label={`${t('common.description')} (${t('common.optional')})`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              isLoading={isCreating || isUpdating}
              className="flex-1"
            >
              {editingCategory ? t('common.save') : t('common.create')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
