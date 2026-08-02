import {
  Building2,
  ChevronDown,
  FolderKanban,
  Home,
  LogOut,
  MessageCircle,
  Receipt,
  Tags,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { cn } from '../../lib/utils'

const navigationItems = [
  { name: 'Chat', path: '', icon: MessageCircle },
  { name: 'Dashboard', path: 'dashboard', icon: Home },
  { name: 'Gastos', path: 'expenses', icon: Receipt },
  { name: 'Proveedores', path: 'providers', icon: Building2 },
  { name: 'Categorías', path: 'categories', icon: Tags },
  { name: 'Cuentas', path: 'accounts', icon: Wallet },
  { name: 'Centros de Costo', path: 'cost-centers', icon: FolderKanban },
]

export function Sidebar() {
  const { user, companies, signOut } = useAuth()
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const [showCompanyMenu, setShowCompanyMenu] = useState(false)

  const activeCompany = companies.find((c) => c.id === companyId)

  const handleCompanySwitch = (newCompanyId: string) => {
    setShowCompanyMenu(false)
    navigate(`/${newCompanyId}`)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Company Header */}
        <div className="border-b border-sidebar-border">
          <div className="p-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                {activeCompany?.logoUrl ? (
                  <img
                    src={activeCompany.logoUrl}
                    alt={activeCompany.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-sidebar-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {activeCompany?.name || 'Useless Dave'}
                  </p>
                  {companies.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {companies.length} empresas
                    </p>
                  )}
                </div>
                {companies.length > 1 && (
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform',
                      showCompanyMenu && 'rotate-180',
                    )}
                  />
                )}
              </button>

              {/* Company Dropdown */}
              {showCompanyMenu && companies.length > 1 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-10">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => handleCompanySwitch(company.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg',
                        company.id === companyId && 'bg-accent',
                      )}
                    >
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-popover-foreground truncate">
                        {company.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={`/${companyId}/${item.path}`}
              end={item.path === ''}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <span className="text-sidebar-primary font-medium">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.displayName || 'Usuario'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </div>

      {/* Overlay for closing dropdown */}
      {showCompanyMenu && (
        <button
          type="button"
          className="fixed inset-0 z-[-1] cursor-default"
          onClick={() => setShowCompanyMenu(false)}
          aria-label="Close menu"
        />
      )}
    </aside>
  )
}
