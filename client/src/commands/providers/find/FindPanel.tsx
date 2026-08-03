import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Input, SlidePanel } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useFindProviders } from './useFindProviders'

export function FindProviderPanel() {
  const companyId = useCompanyId()
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

  return (
    <SlidePanel
      title={selectedId ? 'Detalle del proveedor' : 'Buscar proveedores'}
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
              <Link
                key={provider.id}
                to={`/${companyId}/accountancy/providers?modal=provider&mode=view&id=${provider.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
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
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">ID: {provider.id}</p>
                </div>
              </Link>
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
