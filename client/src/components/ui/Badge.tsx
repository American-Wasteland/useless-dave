import { cn } from '../../lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
  className?: string
}

export function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-chart-1/20 text-chart-1',
    warning: 'bg-chart-2/20 text-chart-2',
    danger: 'bg-destructive/20 text-destructive',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
