import { Settings, User } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import daveEmblem from '/dave-emblem.svg'
import { useAuth } from '../../features/auth/AuthContext'

export function ChatLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fun background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={daveEmblem}
            alt="Dave"
            className="w-10 h-10 drop-shadow-md"
          />
          <span className="text-xl font-black text-foreground">Dave</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="relative group">
            <button
              type="button"
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
            <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-card rounded-xl shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
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
