import { Input } from '../../../../components/ui'
import type { WizardData } from '../ProviderWizard'

interface StepIdentityProps {
  data: WizardData
  onChange: (patch: Partial<WizardData>) => void
}

export function StepIdentity({ data, onChange }: StepIdentityProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Identificación
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Datos básicos del proveedor
        </p>
      </div>
      <Input
        id="nit"
        label="NIT *"
        value={data.nit}
        onChange={(e) => onChange({ nit: e.target.value })}
        placeholder="ej: 900123456-7"
        autoFocus
      />
      <Input
        id="name"
        label="Nombre *"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder={
          data.providerType === 'business'
            ? 'ej: Distribuidora Médica S.A.S.'
            : 'ej: Juan García Pérez'
        }
      />
      <Input
        id="address"
        label="Dirección (opcional)"
        value={data.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="ej: Calle 123 #45-67, Bogotá"
      />
    </div>
  )
}
