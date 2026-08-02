import { Outlet } from 'react-router-dom'
import { CommandPalette } from './components'

export function CommandView() {
  return (
    <>
      {/* Command Palette - always visible */}
      <div className="h-full flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-3xl">
          {/* Logo/Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-primary mb-2">
              Useless Dave
            </h1>
            <p className="text-muted-foreground">
              Sistema de comandos para tu ERP
            </p>
          </div>

          {/* Command Palette */}
          <CommandPalette />

          {/* Recent commands or help text could go here */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">Comandos disponibles:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <code className="px-2 py-1 bg-secondary/10 rounded text-xs">
                /crear-categoria-contable
              </code>
              <code className="px-2 py-1 bg-secondary/10 rounded text-xs">
                /crear-proveedor
              </code>
              <code className="px-2 py-1 bg-secondary/10 rounded text-xs">
                /crear-gasto
              </code>
              <code className="px-2 py-1 bg-secondary/10 rounded text-xs">
                /ver-gastos
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Command panels render here via Outlet */}
      <Outlet />
    </>
  )
}
