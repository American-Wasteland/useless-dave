import type { CostCenterStatus } from '@useless-dave/shared'
import { Input, Select } from '../../../../components/ui'
import type { CostCenterWizardData } from '../CostCenterWizard'

interface StepDetailsProps {
  data: CostCenterWizardData
  onChange: (patch: Partial<CostCenterWizardData>) => void
  mode: 'create' | 'edit'
}

export function StepDetails({ data, onChange, mode }: StepDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Detalles</h2>
        <p className="text-sm text-muted-foreground mt-1">Información del centro de costo</p>
      </div>
      <Input
        id="name"
        label="Nombre *"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="ej: Proyecto Sede Norte"
        autoFocus
      />
      <Input
        id="description"
        label="Descripción (opcional)"
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="ej: Construcción de nueva sede"
      />
      {mode === 'edit' && (
        <Select
          id="status"
          label="Estado"
          value={data.status}
          onChange={(e) => onChange({ status: e.target.value as CostCenterStatus })}
          options={[
            { value: 'active', label: '🟢 Activo' },
            { value: 'completed', label: '✅ Completado' },
            { value: 'cancelled', label: '❌ Cancelado' },
          ]}
        />
      )}
      {mode === 'create' && (
        <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
          El centro de costo se creará con estado <strong>Activo</strong> por defecto.
        </div>
      )}
    </div>
  )
}
