import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const maxWidthMap = {
  '3xl': 'max-w-3xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
}

interface PageLayoutProps {
  title?: string
  subtitle?: ReactNode
  actions?: ReactNode
  maxWidth?: keyof typeof maxWidthMap
  children: ReactNode
}

export function PageLayout({
  title,
  subtitle,
  actions,
  maxWidth = '3xl',
  children,
}: PageLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className={`${maxWidthMap[maxWidth]} mx-auto p-6`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          {actions}
        </div>
        {title && (
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        )}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
