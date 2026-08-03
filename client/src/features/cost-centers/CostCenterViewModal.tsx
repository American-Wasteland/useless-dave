import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, SlidePanel } from '../../components/ui'
import { useCompanyId } from '../../hooks/useCompanyId'
import { getCostCenter } from '../../hooks/useCostCenters'

export function CostCenterViewModal() {
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const costCenterId = searchParams.get('id')

  const { data: costCenter, isLoading } = useQuery({
    queryKey: ['costCenters', companyId, costCenterId],
    queryFn: () => getCostCenter(companyId!, costCenterId!),
    enabled: !!companyId && !!costCenterId,
  })

  const editUrl = (() => {
    const params = new URLSearchParams(searchParams)
    params.set('mode', 'update')
    return `?${params.toString()}`
  })()

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

  if (isLoading) {
    return (
      <SlidePanel title="Cargando...">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </SlidePanel>
    )
  }

  if (!costCenter) {
    return (
      <SlidePanel title="Centro de costo no encontrado">
        <div className="text-center py-12 text-gray-500">
          No se encontró el centro de costo
        </div>
      </SlidePanel>
    )
  }

  return (
    <SlidePanel title="Detalle del centro de costo">
      <div className="space-y-6">
        <div>
          <div className="text-xs text-gray-500 font-medium normal-case mb-1">
            Nombre
          </div>
          <div className="text-base font-medium text-gray-900">
            {costCenter.name}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium normal-case mb-1">
              Tipo
            </div>
            <div className="text-sm text-gray-900">
              {getTypeLabel(costCenter.type)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 font-medium normal-case mb-1">
              Estado
            </div>
            <div className="text-sm text-gray-900">
              {getStatusLabel(costCenter.status)}
            </div>
          </div>
        </div>

        {costCenter.description && (
          <div>
            <div className="text-xs text-gray-500 font-medium normal-case mb-1">
              Descripción
            </div>
            <div className="text-sm text-gray-900">
              {costCenter.description}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Link to={editUrl}>
            <Button variant="secondary" className="w-full">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>
    </SlidePanel>
  )
}
