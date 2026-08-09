import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Select } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { getCostCenter, useCostCenters } from '../../../hooks/useCostCenters'
import type { CostCenterStatus, CostCenterType } from '../../../types'

export function CostCenterEditPage() {
  const { costCenterId } = useParams<{ costCenterId: string }>()
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { updateCostCenter } = useCostCenters()

  const [type, setType] = useState<CostCenterType>('project')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CostCenterStatus>('active')
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: costCenter, isLoading } = useQuery({
    queryKey: ['costCenters', companyId, costCenterId],
    queryFn: () => getCostCenter(companyId!, costCenterId!),
    enabled: !!companyId && !!costCenterId,
  })

  useEffect(() => {
    if (costCenter && !loaded) {
      setType(costCenter.type)
      setName(costCenter.name)
      setDescription(costCenter.description || '')
      setStatus(costCenter.status)
      setLoaded(true)
    }
  }, [costCenter, loaded])

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
      navigate(`/${companyId}/accountancy/cost-centers`)
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
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!costCenter) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12 text-gray-500">
          Centro de costo no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link
          to={`/${companyId}/accountancy/cost-centers`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Actualizar centro de costo
        </h1>
      </div>

      <div className="card p-6">
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
            <Link
              to={`/${companyId}/accountancy/cost-centers`}
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
