import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, Select, SlidePanel } from '../../components/ui'
import { useCompanyId } from '../../hooks/useCompanyId'
import { useCostCenters } from '../../hooks/useCostCenters'
import type { CostCenterStatus, CostCenterType } from '../../types'

export function CostCenterCreateModal() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const { createCostCenter } = useCostCenters()

  const [type, setType] = useState<CostCenterType>('project')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status] = useState<CostCenterStatus>('active')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Pre-fill from URL params
  useEffect(() => {
    const typeParam = searchParams.get('type') as CostCenterType
    const nameParam = searchParams.get('name')
    const descParam = searchParams.get('description')

    if (typeParam && (typeParam === 'project' || typeParam === 'operation')) {
      setType(typeParam)
    }
    if (nameParam) setName(nameParam)
    if (descParam) setDescription(descParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setError(null)
    setIsCreating(true)

    try {
      await createCostCenter({
        type,
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      })
      navigate(`/${companyId}/accountancy/cost-centers`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear centro de costo',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <SlidePanel title="Crear centro de costo">
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

        <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
          El centro de costo se creará con estado <strong>Activo</strong> por
          defecto.
        </div>

        <Button type="submit" isLoading={isCreating} className="w-full">
          Crear centro de costo
        </Button>
      </form>
    </SlidePanel>
  )
}
