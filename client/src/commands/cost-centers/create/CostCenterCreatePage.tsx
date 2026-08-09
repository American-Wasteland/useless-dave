import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Select } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCostCenters } from '../../../hooks/useCostCenters'
import type { CostCenterType } from '../../../types'

export function CostCenterCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createCostCenter } = useCostCenters()

  const [type, setType] = useState<CostCenterType>('project')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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
        status: 'active',
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
          Crear centro de costo
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

          <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
            El centro de costo se creará con estado <strong>Activo</strong> por
            defecto.
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Crear centro de costo
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
