import { Outlet } from 'react-router-dom'
import { CommandInput } from './components/CommandInput'

export function CommandInterface() {
  return (
    <>
      {/* Main interface - always visible */}
      <div className="h-full flex flex-col">
        {/* Empty state / welcome */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          <div className="text-center max-w-md">
            {/* Dave avatar */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <img
                  src="/dave-emblem.svg"
                  alt="Dave"
                  className="h-24 w-24 rounded-full bg-secondary/10 p-2"
                />
                <div className="absolute -bottom-1 -right-1 text-2xl">👋</div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-black text-foreground mb-2">
              ¿Qué hacemos hoy?
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Cuéntame qué necesitas o elige una opción
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl border-2 border-border bg-card hover:border-secondary transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span>📊</span>
                <span>Categorías contables</span>
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl border-2 border-border bg-card hover:border-secondary transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span>🔍</span>
                <span>Buscar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Command Input - fixed at bottom */}
        <div className="px-4 pb-8 pt-4">
          <CommandInput />
        </div>
      </div>

      {/* Route panels render here */}
      <Outlet />
    </>
  )
}
