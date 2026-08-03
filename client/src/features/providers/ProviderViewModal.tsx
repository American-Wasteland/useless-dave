import { Eye, Pencil } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProviderById } from '../../commands/providers/update/useProviderById'
import { Button, SlidePanel } from '../../components/ui'
import { useCompanyId } from '../../hooks/useCompanyId'

export function ProviderViewModal() {
  const _companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const providerId = searchParams.get('id')

  const { provider, isLoading } = useProviderById(providerId)

  // Build the edit URL
  const editUrl = (() => {
    const params = new URLSearchParams(searchParams)
    params.set('mode', 'update')
    return `?${params.toString()}`
  })()

  if (isLoading) {
    return (
      <SlidePanel title="Detalle del proveedor">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </SlidePanel>
    )
  }

  if (!provider) {
    return (
      <SlidePanel title="Detalle del proveedor">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Proveedor no encontrado
        </div>
      </SlidePanel>
    )
  }

  return (
    <SlidePanel title="Detalle del proveedor">
      <div className="space-y-6">
        {/* Header with edit button */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{provider.name}</h2>
            <span className="inline-block mt-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {provider.providerType === 'business'
                ? '🏢 Empresa'
                : '👤 Persona Natural'}
            </span>
          </div>
          <Link to={editUrl}>
            <Button variant="secondary">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>

        {/* Basic info */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 font-medium normal-case">
              NIT
            </div>
            <div className="text-sm text-gray-900 mt-1">{provider.nit}</div>
          </div>

          {provider.contactName && (
            <div>
              <div className="text-xs text-gray-500 font-medium normal-case">
                Persona de contacto
              </div>
              <div className="text-sm text-gray-900 mt-1">
                👤 {provider.contactName}
              </div>
            </div>
          )}

          {provider.email && (
            <div>
              <div className="text-xs text-gray-500 font-medium normal-case">
                Email
              </div>
              <div className="text-sm text-gray-900 mt-1">
                📧{' '}
                <a
                  href={`mailto:${provider.email}`}
                  className="text-primary-600 hover:underline"
                >
                  {provider.email}
                </a>
              </div>
            </div>
          )}

          {provider.phone && (
            <div>
              <div className="text-xs text-gray-500 font-medium normal-case">
                Teléfono
              </div>
              <div className="text-sm text-gray-900 mt-1">
                📞{' '}
                <a
                  href={`tel:${provider.phone}`}
                  className="text-primary-600 hover:underline"
                >
                  {provider.phone}
                </a>
              </div>
            </div>
          )}

          {provider.address && (
            <div>
              <div className="text-xs text-gray-500 font-medium normal-case">
                Dirección
              </div>
              <div className="text-sm text-gray-900 mt-1">
                📍 {provider.address}
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        {(provider.rutUrl || provider.bankAccountUrl) && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 font-medium normal-case mb-3">
              Documentos
            </div>
            <div className="space-y-2">
              {provider.rutUrl && (
                <a
                  href={provider.rutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600">
                    RUT
                  </span>
                </a>
              )}
              {provider.bankAccountUrl && (
                <a
                  href={provider.bankAccountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                  <span className="text-sm text-gray-700 group-hover:text-green-600">
                    Certificación bancaria
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-400 space-y-1">
            <div>ID: {provider.id}</div>
            {provider.createdAt && (
              <div>
                Creado:{' '}
                {new Date(provider.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SlidePanel>
  )
}
