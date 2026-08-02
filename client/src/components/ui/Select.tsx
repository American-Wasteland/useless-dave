import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-xs text-gray-500 font-medium normal-case"
          >
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={cn(
            'block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1',
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive'
              : 'border-input focus:border-ring focus:ring-ring',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'

export { Select }
