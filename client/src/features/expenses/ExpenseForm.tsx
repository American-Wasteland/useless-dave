import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FileUpload, Input, Select } from '../../components/ui'
import { useCostCenters } from '../../hooks/useCostCenters'
import { formatDateInput } from '../../lib/utils'
import type { ExpenseFormData } from '../../types'
import { useAuth } from '../auth'
import { ProviderModal } from '../providers/ProviderModal'
import { useProviders } from '../providers/useProviders'
import { createExpense } from './expenseService'

export function ExpenseForm() {
  const navigate = useNavigate()
  const { user, companyId } = useAuth()
  const { providers, refetch: refetchProviders } = useProviders()
  const { costCenters } = useCostCenters()

  const [isLoading, setIsLoading] = useState(false)
  const [showProviderModal, setShowProviderModal] = useState(false)
  const [formData, setFormData] = useState<ExpenseFormData>({
    providerId: '',
    totalAmount: 0,
    taxDeductions: 0,
    costCenterId: '',
    date: formatDateInput(new Date()),
    description: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExpenseFormData, string>>
  >({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {}

    if (!formData.providerId) newErrors.providerId = 'Selecciona un proveedor'
    if (!formData.totalAmount || formData.totalAmount <= 0)
      newErrors.totalAmount = 'Ingresa un monto válido'
    if (!formData.costCenterId)
      newErrors.costCenterId = 'Selecciona un centro de costo'
    if (!formData.date) newErrors.date = 'Selecciona una fecha'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !companyId || !user) return

    setIsLoading(true)
    try {
      await createExpense(companyId, user.uid, formData)
      navigate('/expenses')
    } catch (error) {
      console.error('Error creating expense:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderCreated = () => {
    refetchProviders()
    setShowProviderModal(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Gasto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                id="provider"
                label="Proveedor"
                value={formData.providerId}
                onChange={(e) =>
                  setFormData({ ...formData, providerId: e.target.value })
                }
                options={providers.map((p) => ({ value: p.id, label: p.name }))}
                placeholder="Seleccionar proveedor"
                error={errors.providerId}
              />
            </div>
            <div className="pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowProviderModal(true)}
              >
                + Nuevo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="totalAmount"
              label="Monto Total (COP)"
              type="number"
              value={formData.totalAmount || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalAmount: Number(e.target.value),
                })
              }
              error={errors.totalAmount}
            />
            <Input
              id="taxDeductions"
              label="Retenciones"
              type="number"
              value={formData.taxDeductions || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taxDeductions: Number(e.target.value),
                })
              }
            />
          </div>

          <Select
            id="costCenter"
            label="Centro de Costo"
            value={formData.costCenterId}
            onChange={(e) =>
              setFormData({ ...formData, costCenterId: e.target.value })
            }
            options={costCenters.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Seleccionar centro de costo"
            error={errors.costCenterId}
          />

          <Input
            id="date"
            label="Fecha"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={errors.date}
          />

          <Input
            id="description"
            label="Descripción"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <FileUpload
            label="Factura"
            value={formData.invoiceFile}
            onChange={(file) =>
              setFormData({ ...formData, invoiceFile: file || undefined })
            }
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={isLoading}>
            Crear Gasto
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/expenses')}
          >
            Cancelar
          </Button>
        </div>
      </form>

      <ProviderModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        onSuccess={handleProviderCreated}
      />
    </div>
  )
}
