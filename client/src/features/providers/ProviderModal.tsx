import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Input, Modal } from '../../components/ui'
import type { ProviderFormData } from '../../types'
import { createProvider } from './providerService'

interface ProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProviderModal({
  isOpen,
  onClose,
  onSuccess,
}: ProviderModalProps) {
  const { companyId } = useParams<{ companyId: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    rut: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProviderFormData, string>>
  >({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProviderFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido'
    if (!formData.rut.trim()) newErrors.rut = 'NIT/RUT es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !companyId) return

    setIsLoading(true)
    try {
      await createProvider(companyId, formData)
      setFormData({ name: '', rut: '' })
      onSuccess()
    } catch (error) {
      console.error('Error creating provider:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', rut: '' })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Proveedor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Nombre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          autoFocus
        />

        <Input
          id="rut"
          label="NIT/RUT"
          value={formData.rut}
          onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
          error={errors.rut}
        />

        <Input
          id="address"
          label="Dirección (opcional)"
          value={formData.address || ''}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />

        <Input
          id="email"
          label="Email (opcional)"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          id="phone"
          label="Teléfono (opcional)"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Crear Proveedor
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
