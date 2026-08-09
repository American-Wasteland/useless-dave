import { ArrowLeft, Eye, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useProviderById } from '../update/useProviderById'

export function ProviderViewPage() {
  const { providerId } = useParams<{ providerId: string }>()
  const companyId = useCompanyId()
  const { provider, isLoading } = useProviderById(providerId ?? null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Proveedor no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/${companyId}/accountancy/providers`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <Link to={`/${companyId}/accountancy/providers/${providerId}/edit`}>
          <Button variant="secondary">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="card p-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
          <span className="inline-block mt-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {provider.providerType === 'business'
              ? '🏢 Empresa'
              : '👤 Persona Natural'}
          </span>
        </div>

        {/* Basic info */}
        <div className="space-y-4">
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
          <div className="pt-4 border-t border-gray-200 mt-6">
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
        <div className="pt-4 border-t border-gray-200 mt-6">
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
    </div>
  )
}
