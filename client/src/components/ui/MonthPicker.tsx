import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '../../lib/utils'

const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

interface MonthPickerProps {
  value: string // YYYY-MM
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

export function MonthPicker({
  value,
  onChange,
  label,
  placeholder = 'Selecciona un mes',
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)

  const parsed = value ? value.split('-') : null
  const selectedYear = parsed ? parseInt(parsed[0], 10) : null
  const selectedMonth = parsed ? parseInt(parsed[1], 10) - 1 : null // 0-indexed

  const [viewYear, setViewYear] = React.useState(
    selectedYear ?? new Date().getFullYear(),
  )

  const displayValue = parsed
    ? new Date(selectedYear!, selectedMonth!).toLocaleDateString('es-CO', {
        month: 'long',
        year: 'numeric',
      })
    : null

  const handleSelect = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, '0')
    onChange(`${viewYear}-${mm}`)
    setOpen(false)
  }

  const triggerId = React.useId()

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={triggerId}
          className="text-xs text-gray-500 font-medium normal-case"
        >
          {label}
        </label>
      )}
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            id={triggerId}
            type="button"
            className={cn(
              'flex items-center justify-between w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 border-input focus:border-ring focus:ring-ring transition-colors',
              !value && 'text-muted-foreground',
            )}
          >
            <span>{displayValue ?? placeholder}</span>
            <CalendarIcon className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            sideOffset={4}
            align="start"
            className="z-50 w-60 rounded-xl bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none"
          >
            {/* Year navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setViewYear((y) => y - 1)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold">{viewYear}</span>
              <button
                type="button"
                onClick={() => setViewYear((y) => y + 1)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((name, i) => {
                const isSelected =
                  viewYear === selectedYear && i === selectedMonth
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelect(i)}
                    className={cn(
                      'py-2 text-sm rounded-lg font-medium transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground',
                    )}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}
