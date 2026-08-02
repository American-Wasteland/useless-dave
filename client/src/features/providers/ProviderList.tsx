import { Building2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui'
import { useAuth } from '../auth'
import { ProviderModal } from './ProviderModal'
import { deleteProvider } from './providerService'
import { useProviders } from './useProviders'

export function ProviderList() {
  const { companyId } = useAuth()
  const { providers, isLoading, refetch } = useProviders()
  const [showModal, setShowModal] = useState(false)

  const handleDelete = async (providerId: string, name: string) => {
    if (!companyId) return
    if (!confirm(`¿Estás seguro de eliminar el proveedor "${name}"?`)) return

    try {
      await deleteProvider(companyId, providerId)
      refetch()
    } catch (error) {
      console.error('Error deleting provider:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="card p-8 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay proveedores
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza agregando tu primer proveedor
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <div key={provider.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-500">NIT: {provider.rut}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(provider.id, provider.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {(provider.email || provider.phone) && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  {provider.email && <p>{provider.email}</p>}
                  {provider.phone && <p>{provider.phone}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ProviderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          refetch()
          setShowModal(false)
        }}
      />
    </div>
  )
}
