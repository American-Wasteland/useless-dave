import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, Select, SlidePanel } from '../../components/ui'
import { useCompanyId } from '../../hooks/useCompanyId'
import { getCostCenter, useCostCenters } from '../../hooks/useCostCenters'
import type { CostCenterStatus, CostCenterType } from '../../types'

export function CostCenterUpdateModal() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const costCenterId = searchParams.get('id')
  const { updateCostCenter } = useCostCenters()

  const { data: costCenter, isLoading } = useQuery({
    queryKey: ['costCenters', companyId, costCenterId],
    queryFn: () => getCostCenter(companyId!, costCenterId!),
    enabled: !!companyId && !!costCenterId,
  })

  const [type, setType] = useState<CostCenterType>(
    costCenter?.type || 'project',
  )
  const [name, setName] = useState(costCenter?.name || '')
  const [description, setDescription] = useState(costCenter?.description || '')
  const [status, setStatus] = useState<CostCenterStatus>(
    costCenter?.status || 'active',
  )
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Update local state when costCenter loads
  if (costCenter && name === '' && !isUpdating) {
    setType(costCenter.type)
    setName(costCenter.name)
    setDescription(costCenter.description || '')
    setStatus(costCenter.status)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !costCenterId) {
      setError('El nombre es requerido')
      return
    }

    setError(null)
    setIsUpdating(true)

    try {
      await updateCostCenter(costCenterId, {
        type,
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      })
      navigate(-1)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al actualizar centro de costo',
      )
    } finally {
      setIsUpdating(false)
    }
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
    <SlidePanel title="Actualizar centro de costo">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <Select
          id="type"
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value as CostCenterType)}
          options={[
            { value: 'project', label: '📁 Proyecto' },
            { value: 'operation', label: '⚙️ Operación' },
          ]}
        />

        <Input
          id="name"
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej: Proyecto Sede Norte"
          autoFocus
        />

        <Input
          id="description"
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ej: Construcción de nueva sede"
        />

        <Select
          id="status"
          label="Estado"
          value={status}
          onChange={(e) => setStatus(e.target.value as CostCenterStatus)}
          options={[
            { value: 'active', label: '🟢 Activo' },
            { value: 'completed', label: '✅ Completado' },
            { value: 'cancelled', label: '❌ Cancelado' },
          ]}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isUpdating} className="flex-1">
            Guardar cambios
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </div>
      </form>
    </SlidePanel>
  )
}
