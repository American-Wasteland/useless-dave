import type { CostCenterType } from '@useless-dave/shared'
import { cn } from '../../../../lib/utils'

interface StepTypeProps {
  value: CostCenterType
  onChange: (v: CostCenterType) => void
}

export function StepType({ value, onChange }: StepTypeProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Tipo de centro de costo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ¿Cómo clasificas este centro?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={() => onChange('project')}
          className={cn(
            'p-6 rounded-xl border-2 text-left transition-all space-y-2',
            value === 'project'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground',
          )}
        >
          <div className="text-3xl">📁</div>
          <div className="font-semibold text-sm text-foreground">Proyecto</div>
          <div className="text-xs text-muted-foreground">
            Iniciativa con inicio y fin definido
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange('operation')}
          className={cn(
            'p-6 rounded-xl border-2 text-left transition-all space-y-2',
            value === 'operation'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground',
          )}
        >
          <div className="text-3xl">⚙️</div>
          <div className="font-semibold text-sm text-foreground">Operación</div>
          <div className="text-xs text-muted-foreground">
            Actividad recurrente o continua
          </div>
        </button>
      </div>
    </div>
  )
}
