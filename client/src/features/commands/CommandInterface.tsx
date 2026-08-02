import { Building2 } from 'lucide-react'
import { Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CommandInput } from './components/CommandInput'

export function CommandInterface() {
  const { companyId } = useParams<{ companyId: string }>()
  const { companies } = useAuth()

  // Get current company from already-loaded companies
  const currentCompany = companies.find((c) => c.id === companyId)

  return (
    <>
      {/* Main interface - always visible */}
      <div className="h-full flex flex-col items-center justify-start px-4 pt-32">
        <div className="text-center max-w-2xl w-full">
          {/* Dave + Company logos */}
          <div className="mb-6 flex justify-center gap-4 items-center">
            {/* Dave emblem */}
            <div className="relative">
              <img
                src="/dave-emblem.svg"
                alt="Dave"
                className="h-24 w-24 rounded-full bg-secondary/10 p-2"
              />
              <div className="absolute -bottom-1 -right-1 text-2xl">👋</div>
            </div>

            {/* Company logo (if exists) */}
            {currentCompany && (
              <>
                <span className="text-3xl text-muted-foreground">+</span>
                <div className="relative">
                  {currentCompany.logoUrl ? (
                    <div className="h-24 w-24 rounded-full bg-secondary/10 p-2 flex items-center justify-center">
                      <img
                        src={currentCompany.logoUrl}
                        alt={currentCompany.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-secondary/10 p-2 flex items-center justify-center">
                      <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-black text-foreground mb-2">
            ¿Qué hacemos hoy?
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {currentCompany ? (
              <>
                Cuéntame qué necesitas en{' '}
                <span className="font-semibold text-foreground">
                  {currentCompany.name}
                </span>
              </>
            ) : (
              'Cuéntame qué necesitas o elige una opción'
            )}
          </p>

          {/* Command Input - centered with content */}
          <CommandInput />
        </div>
      </div>

      {/* Route panels render here */}
      <Outlet />
    </>
  )
}
