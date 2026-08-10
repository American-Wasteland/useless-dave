import { Input } from '../../../../components/ui'
import type { CostCenterWizardData } from '../CostCenterWizard'

interface StepDetailsProps {
  data: CostCenterWizardData
  onChange: (patch: Partial<CostCenterWizardData>) => void
}

export function StepDetails({ data, onChange }: StepDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Detalles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Información del centro de costo
        </p>
      </div>
      <Input
        id="name"
        label="Nombre *"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="ej: Proyecto Sede Norte"
        autoFocus
      />
    </div>
  )
}
