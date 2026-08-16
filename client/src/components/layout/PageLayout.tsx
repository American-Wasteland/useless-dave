import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const maxWidthMap = {
  '3xl': 'max-w-3xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
}

export interface Breadcrumb {
  label: string
  href?: string
}

interface PageLayoutProps {
  title?: string
  subtitle?: ReactNode
  actions?: ReactNode
  maxWidth?: keyof typeof maxWidthMap
  breadcrumbs?: Breadcrumb[]
  children: ReactNode
}

export function PageLayout({
  title,
  subtitle,
  actions,
  maxWidth = '3xl',
  breadcrumbs,
  children,
}: PageLayoutProps) {
  const hasBreadcrumbs = !!(breadcrumbs && breadcrumbs.length > 0)

  return (
    <div className={`${maxWidthMap[maxWidth]} mx-auto p-6`}>
      <div className="mb-6">
        {(hasBreadcrumbs || actions) && (
          <div
            className={`flex items-center mb-4 ${hasBreadcrumbs ? 'justify-between' : 'justify-end'}`}
          >
            {hasBreadcrumbs && (
              <nav
                className="flex items-center gap-1 text-sm"
                aria-label="Breadcrumb"
              >
                {breadcrumbs!.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                    )}
                    {crumb.href ? (
                      <Link
                        to={crumb.href}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-semibold">
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            {actions}
          </div>
        )}
        {title && (
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        )}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
