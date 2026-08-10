import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout'
import { ConfirmModal } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useDeleteProvider } from './useDeleteProvider'
import { useListProviders } from './useListProviders'

const ITEMS_PER_PAGE = 20

export function ListProvidersPage() {
  const companyId = useCompanyId()
  const { providers, isLoading } = useListProviders()
  const { deleteProvider, isDeleting } = useDeleteProvider()
  const [searchParams] = useSearchParams()
  const focusSearch =
    searchParams.get('focus') === 'search' || !!searchParams.get('q')

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    name: string
  } | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusSearch) {
      searchRef.current?.focus()
    }
  }, [focusSearch])

  // Reset page when query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [])

  const filtered = query.trim()
    ? providers.filter((p) => {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.nit.includes(q) ||
          p.contactName?.toLowerCase().includes(q)
        )
      })
    : providers

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentProviders = filtered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  )

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    try {
      await deleteProvider(deleteConfirm.id)
      setDeleteConfirm(null)
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
    <PageLayout
      maxWidth="7xl"
      title="Proveedores"
      subtitle={`${providers.length} proveedor${providers.length !== 1 ? 'es' : ''} registrado${providers.length !== 1 ? 's' : ''}`}
      actions={
        <Link
          to={`/${companyId}/accountancy/providers/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Nuevo proveedor
        </Link>
      }
    >
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar proveedor"
        message={`¿Estás seguro de que deseas eliminar el proveedor "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, NIT o contacto..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">
            {query.trim()
              ? `No se encontraron proveedores para "${query}"`
              : 'No hay proveedores registrados. Usa '}
            {!query.trim() && (
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                /crear-proveedor
              </code>
            )}
            {!query.trim() && ' para crear uno.'}
          </p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persona de contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProviders.map((provider) => (
                  <tr
                    key={provider.id}
                    className="hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {provider.providerType === 'business'
                          ? '🏢 Empresa'
                          : '👤 Natural'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/${companyId}/accountancy/providers/${provider.id}`}
                        className="text-sm font-medium text-gray-900 before:absolute before:inset-0"
                      >
                        {provider.name}
                      </Link>
                      {provider.email && (
                        <div className="text-xs text-gray-500">
                          {provider.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {provider.nit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {provider.contactName || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {provider.phone && (
                        <div className="text-sm text-gray-500">
                          📞 {provider.phone}
                        </div>
                      )}
                      {provider.email && (
                        <div className="text-xs text-gray-400 mt-1">
                          {provider.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 relative z-10">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/${companyId}/accountancy/providers/${provider.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(provider.id, provider.name)
                          }
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  )
}
