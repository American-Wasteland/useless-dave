import { FolderKanban, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button, Input, Modal } from '../components/ui'
import { useCostCenters } from '../hooks/useCostCenters'

export function CostCentersPage() {
  const { costCenters, isLoading, createCostCenter, deleteCostCenter } =
    useCostCenters()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)
    try {
      await createCostCenter(name, description)
      setName('')
      setDescription('')
      setShowModal(false)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = (id: string, ccName: string) => {
    if (confirm(`¿Eliminar "${ccName}"?`)) {
      deleteCostCenter(id)
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Centros de Costo</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Centro
        </Button>
      </div>

      {costCenters.length === 0 ? (
        <div className="card p-8 text-center">
          <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay centros de costo
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer centro de costo para categorizar gastos
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Centro
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {costCenters.map((cc) => (
            <div key={cc.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{cc.name}</h3>
                  {cc.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {cc.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cc.id, cc.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Centro de Costo"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Input
            id="description"
            label="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Crear
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
