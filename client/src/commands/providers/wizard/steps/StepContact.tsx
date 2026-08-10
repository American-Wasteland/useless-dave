import { Input } from '../../../../components/ui'
import type { WizardData } from '../ProviderWizard'

interface StepContactProps {
  data: WizardData
  onChange: (patch: Partial<WizardData>) => void
}

export function StepContact({ data, onChange }: StepContactProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Persona de contacto</h2>
        <p className="text-sm text-muted-foreground mt-1">
          ¿A quién contactamos en este proveedor? (opcional)
        </p>
      </div>
      <Input
        id="contactName"
        label="Nombre"
        value={data.contactName}
        onChange={(e) => onChange({ contactName: e.target.value })}
        placeholder="ej: María López"
        autoFocus
      />
      <Input
        id="email"
        type="email"
        label="Email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="ej: contacto@proveedor.com"
      />
      <Input
        id="phone"
        label="Teléfono"
        value={data.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="ej: +57 300 1234567"
      />
    </div>
  )
}
