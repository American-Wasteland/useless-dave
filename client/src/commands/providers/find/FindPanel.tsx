import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input, SlidePanel } from '../../../components/ui'
import { useFindProviders } from './useFindProviders'

export function FindProviderPanel() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const { providers, isLoading } = useFindProviders()

  const initialQuery = searchParams.get('query') || ''
  const selectedId = searchParams.get('selectedId') || ''
  const [query, setQuery] = useState(initialQuery)

  const filteredProviders = useMemo(() => {
    // If selectedId is present, show only that provider
    if (selectedId) {
      return providers.filter((p) => p.id === selectedId)
    }

    // Otherwise filter by query
    if (!query.trim()) return providers

    const normalized = query.toLowerCase().trim()
    return providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(normalized) ||
        provider.nit.includes(normalized) ||
        provider.id === query.trim() ||
        provider.email?.toLowerCase().includes(normalized),
    )
  }, [providers, query, selectedId])

  const handleClose = () => {
    navigate(`/${companyId}`)
  }

  return (
    <SlidePanel
      title={selectedId ? 'Detalle del proveedor' : 'Buscar proveedores'}
      onClose={handleClose}
    >
      <div className="space-y-4">
        {!selectedId && (
          <Input
            id="search"
            label="Buscar por nombre, NIT o ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para filtrar..."
            icon={<Search className="h-4 w-4 text-gray-400" />}
            autoFocus
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {query.trim()
              ? 'No se encontraron proveedores'
              : 'No hay proveedores registrados'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {provider.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {provider.providerType === 'business'
                          ? '🏢 Empresa'
                          : '👤 Persona Natural'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      NIT: {provider.nit}
                    </p>
                    {provider.contactName && (
                      <p className="text-sm text-gray-500 mt-1">
                        👤 {provider.contactName}
                      </p>
                    )}
                    {provider.email && (
                      <p className="text-sm text-gray-500 mt-1">
                        📧 {provider.email}
                      </p>
                    )}
                    {provider.phone && (
                      <p className="text-sm text-gray-500 mt-1">
                        📞 {provider.phone}
                      </p>
                    )}
                    {provider.address && (
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {provider.address}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {provider.rutUrl && (
                      <a
                        href={provider.rutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        RUT
                      </a>
                    )}
                    {provider.bankAccountUrl && (
                      <a
                        href={provider.bankAccountUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        Cuenta Bancaria
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">ID: {provider.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="text-sm text-gray-500 text-center pt-2">
            {filteredProviders.length} proveedor
            {filteredProviders.length !== 1 ? 'es' : ''} encontrado
            {filteredProviders.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </SlidePanel>
  )
}
