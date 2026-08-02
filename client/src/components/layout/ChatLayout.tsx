import { Building2, Settings, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import daveEmblem from '/dave-emblem.svg'
import { useAuth } from '../../features/auth/AuthContext'

export function ChatLayout() {
  const { user, signOut, companies } = useAuth()
  const { companyId } = useParams<{ companyId: string }>()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Get current company from already-loaded companies
  const currentCompany = companies.find((c) => c.id === companyId)

  const handleSignOut = async () => {
    setShowUserMenu(false)
    await signOut()
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      // Use setTimeout to avoid race condition with button clicks
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fun background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={daveEmblem}
            alt="Dave"
            className="w-10 h-10 drop-shadow-md"
          />
          <span className="text-xl font-black text-foreground">Dave</span>

          {/* Company logo/name */}
          {currentCompany && (
            <>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2">
                {currentCompany.logoUrl ? (
                  <img
                    src={currentCompany.logoUrl}
                    alt={currentCompany.name}
                    className="w-8 h-8 rounded-lg object-cover border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center border border-border">
                    <Building2 className="w-4 h-4 text-secondary" />
                  </div>
                )}
                <span className="text-sm font-semibold text-foreground">
                  {currentCompany.name}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              // biome-ignore lint/a11y/noStaticElementInteractions: Need to stop propagation to prevent close
              <div
                className="absolute right-0 top-full mt-2 w-48 py-2 bg-card rounded-xl shadow-xl border border-border z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/select-company"
                  state={{ skipAutoRedirect: true }}
                  onClick={() => setShowUserMenu(false)}
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
                >
                  Cambiar empresa
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content - Chat */}
      <main className="relative z-10 h-[calc(100vh-76px)]">
        <Outlet />
      </main>
    </div>
  )
}
