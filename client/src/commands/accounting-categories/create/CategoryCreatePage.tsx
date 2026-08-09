import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCreateCategory } from './useCreateCategory'

export function CategoryCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const { createCategory, isCreating } = useCreateCategory()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setError(null)
    try {
      await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      navigate(`/${companyId}/accountancy/categories`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link
          to={`/${companyId}/accountancy/categories`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Crear categoría contable
        </h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <Input
            id="name"
            label="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Insumos médicos"
            autoFocus
          />

          <Input
            id="description"
            label="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ej: Materiales e insumos para procedimientos"
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Crear categoría
            </Button>
            <Link
              to={`/${companyId}/accountancy/categories`}
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
