import type { ProviderType } from '@useless-dave/shared'
import { cn } from '../../../../lib/utils'

interface StepTypeProps {
  value: ProviderType
  onChange: (v: ProviderType) => void
}

export function StepType({ value, onChange }: StepTypeProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Tipo de proveedor
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ¿Con quién estás trabajando?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={() => onChange('business')}
          className={cn(
            'p-6 rounded-xl border-2 text-left transition-all space-y-2',
            value === 'business'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground',
          )}
        >
          <div className="text-3xl">🏢</div>
          <div className="font-semibold text-sm text-foreground">Empresa</div>
          <div className="text-xs text-muted-foreground">
            Persona jurídica o sociedad
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange('natural-person')}
          className={cn(
            'p-6 rounded-xl border-2 text-left transition-all space-y-2',
            value === 'natural-person'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground',
          )}
        >
          <div className="text-3xl">👤</div>
          <div className="font-semibold text-sm text-foreground">
            Persona Natural
          </div>
          <div className="text-xs text-muted-foreground">
            Individuo o trabajador independiente
          </div>
        </button>
      </div>
    </div>
  )
}
