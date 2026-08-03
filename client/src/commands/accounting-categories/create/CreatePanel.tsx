import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, SlidePanel } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCreateCategory } from './useCreateCategory'

export function CreateCategoryPanel() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const { createCategory, isCreating } = useCreateCategory()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Pre-fill from URL params
  useEffect(() => {
    const nameParam = searchParams.get('name')
    const descParam = searchParams.get('description')
    if (nameParam) setName(nameParam)
    if (descParam) setDescription(descParam)
  }, [searchParams])

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
      setSuccess(true)
      // Show success briefly, then close
      setTimeout(() => {
        navigate(`/${companyId}/accountancy/categories`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría')
    }
  }

  return (
    <SlidePanel title="Crear categoría contable">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
            ✅ Categoría creada exitosamente
          </div>
        )}

        <Input
          id="name"
          label="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej: Insumos médicos"
          autoFocus
          disabled={success}
        />

        <Input
          id="description"
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ej: Materiales e insumos para procedimientos"
          disabled={success}
        />

        <Button
          type="submit"
          isLoading={isCreating}
          disabled={success}
          className="w-full"
        >
          Crear categoría
        </Button>
      </form>
    </SlidePanel>
  )
}
