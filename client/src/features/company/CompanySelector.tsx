import { Building2, ChevronRight, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import daveEmblem from '/dave-emblem.svg'
import { Button } from '../../components/ui/Button'
import type { Company } from '../../types'
import { useAuth } from '../auth/AuthContext'

export function CompanySelector() {
  const { companies, loading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const skipAutoRedirect = (location.state as { skipAutoRedirect?: boolean })
    ?.skipAutoRedirect

  // Auto-redirect if only one company (unless user manually clicked "Cambiar empresa")
  useEffect(() => {
    if (!loading && companies.length === 1 && !skipAutoRedirect) {
      navigate(`/${companies[0].id}`, { replace: true })
    }
  }, [loading, companies, navigate, skipAutoRedirect])

  const handleSelectCompany = (company: Company) => {
    navigate(`/${company.id}`)
  }

  if (loading || (companies.length === 1 && !skipAutoRedirect)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-secondary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Fun background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <img
            src={daveEmblem}
            alt="Useless Dave"
            className="w-16 h-16 mx-auto mb-3 drop-shadow-lg"
          />
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">
            Useless Dave
          </h1>
          {user && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <img
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-secondary"
              />
              <p className="text-muted-foreground">
                ¡Hola,{' '}
                <span className="font-semibold text-foreground">
                  {user.displayName?.split(' ')[0]}
                </span>
                ! 👋
              </p>
            </div>
          )}
        </div>

        <div className="w-full max-w-md">
          {/* Main card */}
          <div className="bg-card rounded-3xl shadow-2xl border-2 border-border p-8">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-bold mb-4">
                🏢 {companies.length}{' '}
                {companies.length === 1 ? 'negocio' : 'negocios'}
              </span>
              <h2 className="text-2xl font-black text-card-foreground">
                ¿En cuál te ayudo?
              </h2>
            </div>

            {/* Company List */}
            <div className="space-y-3 mb-6">
              {companies.map((company, index) => (
                <button
                  type="button"
                  key={company.id}
                  onClick={() => handleSelectCompany(company)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-secondary hover:bg-secondary/10 transition-all text-left group transform hover:scale-[1.02]"
                  style={{
                    transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)`,
                  }}
                >
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-border shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center border-2 border-secondary/30">
                      <Building2 className="w-7 h-7 text-secondary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-card-foreground truncate text-lg">
                      {company.name}
                    </p>
                    <p className="text-sm text-muted-foreground">Entrar →</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-all group-hover:scale-110">
                    <ChevronRight className="w-5 h-5 text-secondary group-hover:text-secondary-foreground" />
                  </div>
                </button>
              ))}
            </div>

            {/* Create new company */}
            <Link to="/create-company">
              <Button
                variant="outline"
                size="lg"
                className="w-full font-bold rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar negocio
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
            Dave administra todos tus negocios 💼
          </p>
        </div>
      </div>
    </div>
  )
}
