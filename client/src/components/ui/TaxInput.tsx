import { RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface TaxInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  autoValue: number
  autoLabel?: string // e.g., "Auto: 19%" or "Auto: 4%"
  placeholder?: string
  disabled?: boolean
}

export function TaxInput({
  label,
  value,
  onChange,
  autoValue,
  autoLabel,
  placeholder = '0',
  disabled = false,
}: TaxInputProps) {
  const [isManual, setIsManual] = useState(false)
  const inputId = useRef(
    `tax-input-${Math.random().toString(36).slice(2, 11)}`,
  ).current

  // Auto-update when autoValue changes (if not manual)
  useEffect(() => {
    if (!isManual && autoValue !== value) {
      onChange(autoValue)
    }
  }, [autoValue, isManual, onChange, value])

  const handleChange = (newValue: number) => {
    setIsManual(true)
    onChange(newValue)
  }

  const handleRecalculate = () => {
    setIsManual(false)
    onChange(autoValue)
  }

  const isDifferent = value !== autoValue

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={inputId}
          className="text-xs text-gray-500 font-medium normal-case"
        >
          {label}
        </label>
        {isManual && isDifferent && (
          <button
            type="button"
            onClick={handleRecalculate}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Recalcular con info del Proveedor
          </button>
        )}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(Number(e.target.value) || 0)}
          placeholder={placeholder}
          step="0.01"
          disabled={disabled}
          className="w-full pl-3 pr-36 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {!isManual && autoLabel && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {autoLabel}
          </span>
        )}
        {isManual && isDifferent && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-600">
            ✏️ Manual
          </span>
        )}
      </div>
    </div>
  )
}
