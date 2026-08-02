import { ArrowRight, ImagePlus, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import daveEmblem from '/dave-emblem.svg'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../auth/AuthContext'
import { createCompany } from './companyService'

export function CreateCompanyPage() {
  const { user, refreshCompanies } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      return
    }

    if (file.size > 1024 * 1024) {
      setError('La imagen no debe superar 1MB')
      return
    }

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setError(null)
  }

  const removeLogo = () => {
    setLogoFile(null)
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (!name.trim()) {
      setError('El nombre de la empresa es requerido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const company = await createCompany(
        user.uid,
        name.trim(),
        logoFile || undefined,
      )
      await refreshCompanies()
      navigate(`/${company.id}`)
    } catch (err) {
      console.error('Error creating company:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Fun background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <img
            src={daveEmblem}
            alt="Useless Dave"
            className="w-16 h-16 mx-auto mb-3 drop-shadow-lg"
          />
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">
            Useless Dave
          </h1>
          <p className="text-muted-foreground">🎉 Ya casi estamos listos 🎉</p>
        </div>

        {/* Progress indicator - fun style */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
            ✓
          </span>
          <div className="w-12 h-1 bg-secondary rounded-full" />
          <span className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold animate-pulse">
            2
          </span>
          <div className="w-12 h-1 bg-muted rounded-full" />
          <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
            3
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Main card */}
          <div className="bg-card rounded-3xl shadow-2xl border-2 border-border p-8 transform hover:scale-[1.01] transition-transform">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-bold mb-4 transform -rotate-1">
                🏢 Nuevo negocio
              </span>
              <h2 className="text-2xl font-black text-card-foreground">
                ¿Cómo se llama tu negocio?
              </h2>
              <p className="text-muted-foreground mt-2">
                Solo esto y Dave se pone a trabajar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload - more fun */}
              <div className="flex justify-center">
                {logoPreview ? (
                  <div className="relative group">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-28 h-28 rounded-2xl object-cover border-4 border-secondary shadow-lg transform rotate-2 hover:rotate-0 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-28 h-28 rounded-2xl border-3 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-secondary/10 transition-all group transform hover:scale-105">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="sr-only"
                    />
                    <ImagePlus className="w-8 h-8 text-muted-foreground group-hover:text-secondary transition-colors" />
                    <span className="text-xs text-muted-foreground mt-1 group-hover:text-secondary font-medium">
                      Logo (opcional)
                    </span>
                  </label>
                )}
              </div>

              {/* Company Name */}
              <div>
                <Input
                  label="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Tacos El Primo 🌮"
                  required
                  className="text-center text-lg"
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20 transform -rotate-1">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full font-bold py-6 rounded-xl text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    ¡Vamos!
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
