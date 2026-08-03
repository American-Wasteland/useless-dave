import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Input, SlidePanel } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCostCenters } from '../../../hooks/useCostCenters'

export function FindCostCenterPanel() {
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const { costCenters, isLoading } = useCostCenters()

  const initialQuery = searchParams.get('query') || ''
  const selectedId = searchParams.get('selectedId') || ''
  const [query, setQuery] = useState(initialQuery)

  const filteredCostCenters = useMemo(() => {
    // If selectedId is present, show only that cost center
    if (selectedId) {
      return costCenters.filter((cc) => cc.id === selectedId)
    }

    // Otherwise filter by query
    if (!query.trim()) return costCenters

    const normalized = query.toLowerCase().trim()
    return costCenters.filter(
      (costCenter) =>
        costCenter.name.toLowerCase().includes(normalized) ||
        costCenter.description?.toLowerCase().includes(normalized) ||
        costCenter.id === query.trim(),
    )
  }, [costCenters, query, selectedId])

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

  return (
    <SlidePanel
      title={
        selectedId ? 'Detalle del centro de costo' : 'Buscar centros de costo'
      }
    >
      <div className="space-y-4">
        {!selectedId && (
          <Input
            id="search"
            label="Buscar por nombre o descripción"
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
        ) : filteredCostCenters.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {query.trim()
              ? 'No se encontraron centros de costo'
              : 'No hay centros de costo registrados'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCostCenters.map((costCenter) => (
              <Link
                key={costCenter.id}
                to={`/${companyId}/accountancy/cost-centers?modal=costCenter&mode=view&id=${costCenter.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-gray-900">
                        {costCenter.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {getTypeLabel(costCenter.type)}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {getStatusLabel(costCenter.status)}
                        </span>
                      </div>
                    </div>
                    {costCenter.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {costCenter.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">ID: {costCenter.id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="text-sm text-gray-500 text-center pt-2">
            {filteredCostCenters.length} centro
            {filteredCostCenters.length !== 1 ? 's' : ''} de costo encontrado
            {filteredCostCenters.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </SlidePanel>
  )
}
