import type { ProviderType } from '@useless-dave/shared'
import { Eye, FileText, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProviderById } from '../../commands/providers/update/useProviderById'
import { useUpdateProvider } from '../../commands/providers/update/useUpdateProvider'
import {
  Button,
  ConfirmModal,
  FileUpload,
  Input,
  Select,
  SlidePanel,
} from '../../components/ui'
import { useCompanyId } from '../../hooks/useCompanyId'

export function ProviderUpdateModal() {
  const navigate = useNavigate()
  const _companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const providerId = searchParams.get('id')

  const { provider, isLoading: isLoadingProvider } = useProviderById(providerId)
  const { updateProvider, isUpdating } = useUpdateProvider()

  const [name, setName] = useState('')
  const [nit, setNit] = useState('')
  const [providerType, setProviderType] = useState<ProviderType>('business')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [deleteDocConfirm, setDeleteDocConfirm] = useState<
    'rut' | 'bankAccount' | null
  >(null)
  const [rutFileToUpload, setRutFileToUpload] = useState<File | null>(null)
  const [bankAccountFileToUpload, setBankAccountFileToUpload] =
    useState<File | null>(null)

  // Load provider data when available
  useEffect(() => {
    if (provider) {
      setName(provider.name)
      setNit(provider.nit)
      setProviderType(provider.providerType)
      setContactName(provider.contactName || '')
      setEmail(provider.email || '')
      setPhone(provider.phone || '')
      setAddress(provider.address || '')
    }
  }, [provider])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!providerId) return

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!nit.trim()) {
      setError('El NIT es requerido')
      return
    }

    setError(null)
    try {
      const files: { rut?: File; bankAccount?: File } = {}
      if (rutFileToUpload) files.rut = rutFileToUpload
      if (bankAccountFileToUpload) files.bankAccount = bankAccountFileToUpload

      await updateProvider({
        providerId,
        data: {
          name: name.trim(),
          nit: nit.trim(),
          providerType,
          contactName: contactName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
        files: Object.keys(files).length > 0 ? files : undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        searchParams.delete('modal')
        searchParams.delete('type')
        searchParams.delete('id')
        navigate(`?${searchParams.toString()}`, { replace: true })
      }, 1500)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar proveedor',
      )
    }
  }

  const handleDeleteDocument = async () => {
    if (!deleteDocConfirm || !providerId) return

    try {
      await updateProvider({
        providerId,
        data: {
          [deleteDocConfirm === 'rut' ? 'rutUrl' : 'bankAccountUrl']: null,
        },
      })
      setDeleteDocConfirm(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar documento',
      )
    }
  }

  if (isLoadingProvider) {
    return (
      <SlidePanel title="Actualizar proveedor">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </SlidePanel>
    )
  }

  if (!provider) {
    return (
      <SlidePanel title="Actualizar proveedor">
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          Proveedor no encontrado
        </div>
      </SlidePanel>
    )
  }

  return (
    <>
      <ConfirmModal
        isOpen={!!deleteDocConfirm}
        onClose={() => setDeleteDocConfirm(null)}
        onConfirm={handleDeleteDocument}
        title="Eliminar documento"
        message={`¿Estás seguro de que deseas eliminar el ${
          deleteDocConfirm === 'rut' ? 'RUT' : 'Certificación bancaria'
        }? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isUpdating}
      />

      <SlidePanel title="Actualizar proveedor">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
              ✅ Proveedor actualizado exitosamente
            </div>
          )}

          <Select
            id="providerType"
            label="Tipo de proveedor"
            value={providerType}
            onChange={(e) => setProviderType(e.target.value as ProviderType)}
            disabled={success}
            options={[
              { value: 'business', label: '🏢 Empresa' },
              { value: 'natural-person', label: '👤 Persona Natural' },
            ]}
          />

          <Input
            id="name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Acme S.A.S."
            autoFocus
            disabled={success}
          />

          <Input
            id="nit"
            label="NIT"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            placeholder="ej: 900123456-7"
            disabled={success}
          />

          <Input
            id="contactName"
            label="Persona de contacto (opcional)"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="ej: Juan Pérez"
            disabled={success}
          />

          <Input
            id="email"
            label="Email (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej: contacto@empresa.com"
            disabled={success}
          />

          <Input
            id="phone"
            label="Teléfono (opcional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ej: +57 300 1234567"
            disabled={success}
          />

          <Input
            id="address"
            label="Dirección (opcional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ej: Calle 123 #45-67"
            disabled={success}
          />

          {/* Documents section */}
          <div className="space-y-3">
            <h3 className="text-xs text-gray-500 font-medium normal-case">
              Documentos
            </h3>

            {/* RUT */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">RUT</span>
                </div>
                {provider?.rutUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={provider.rutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver documento"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setDeleteDocConfirm('rut')}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {!provider?.rutUrl && (
                <FileUpload
                  accept=".pdf"
                  value={rutFileToUpload}
                  onChange={setRutFileToUpload}
                  error={
                    rutFileToUpload &&
                    rutFileToUpload.type !== 'application/pdf'
                      ? 'Solo archivos PDF'
                      : undefined
                  }
                />
              )}
            </div>

            {/* Bank Account */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Certificación bancaria
                  </span>
                </div>
                {provider?.bankAccountUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={provider.bankAccountUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver documento"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setDeleteDocConfirm('bankAccount')}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {!provider?.bankAccountUrl && (
                <FileUpload
                  accept=".pdf"
                  value={bankAccountFileToUpload}
                  onChange={setBankAccountFileToUpload}
                  error={
                    bankAccountFileToUpload &&
                    bankAccountFileToUpload.type !== 'application/pdf'
                      ? 'Solo archivos PDF'
                      : undefined
                  }
                />
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              isLoading={isUpdating}
              disabled={success}
              className="flex-1"
            >
              Actualizar proveedor
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={isUpdating}
            >
              Volver
            </Button>
          </div>
        </form>
      </SlidePanel>
    </>
  )
}
