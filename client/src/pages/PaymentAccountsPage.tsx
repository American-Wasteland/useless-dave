import {
  Banknote,
  Building,
  CreditCard,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Input, Modal, Select } from '../components/ui'
import { usePaymentAccounts } from '../hooks/usePaymentAccounts'

const typeConfig = {
  bank: { label: 'Banco', icon: Building, variant: 'default' as const },
  cash: { label: 'Efectivo', icon: Banknote, variant: 'success' as const },
  card: { label: 'Tarjeta', icon: CreditCard, variant: 'warning' as const },
}

export function PaymentAccountsPage() {
  const {
    paymentAccounts,
    isLoading,
    createPaymentAccount,
    deletePaymentAccount,
  } = usePaymentAccounts()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'bank' | 'cash' | 'card'>('bank')
  const [details, setDetails] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)
    try {
      await createPaymentAccount(name, type, details)
      setName('')
      setType('bank')
      setDetails('')
      setShowModal(false)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = (id: string, accName: string) => {
    if (confirm(`¿Eliminar "${accName}"?`)) {
      deletePaymentAccount(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cuentas de Pago</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      {paymentAccounts.length === 0 ? (
        <div className="card p-8 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay cuentas de pago
          </h3>
          <p className="text-gray-500 mb-4">
            Agrega tus cuentas bancarias y métodos de pago
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentAccounts.map((account) => {
            const config = typeConfig[account.type]
            const Icon = config.icon
            return (
              <div key={account.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {account.name}
                      </h3>
                      <Badge variant={config.variant} className="mt-1">
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(account.id, account.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {account.details && (
                  <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    {account.details}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Cuenta de Pago"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Select
            id="type"
            label="Tipo"
            value={type}
            onChange={(e) =>
              setType(e.target.value as 'bank' | 'cash' | 'card')
            }
            options={[
              { value: 'bank', label: 'Banco' },
              { value: 'cash', label: 'Efectivo' },
              { value: 'card', label: 'Tarjeta' },
            ]}
          />
          <Input
            id="details"
            label="Detalles (opcional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Número de cuenta, banco, etc."
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Crear
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
