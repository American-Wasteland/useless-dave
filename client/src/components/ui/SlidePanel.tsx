import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface SlidePanelProps {
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function SlidePanel({ title, children, size = 'md' }: SlidePanelProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClose = () => {
    // Remove all query params
    navigate(location.pathname, { replace: true })
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
        onClick={handleClose}
        aria-label="Close panel"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 w-full bg-card shadow-2xl border-l border-border',
          'animate-in slide-in-from-right duration-300',
          sizeClasses[size],
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-65px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
