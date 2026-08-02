import type { ProviderType } from '@useless-dave/shared'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, FileUpload, Input, SlidePanel } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCreateProvider } from './useCreateProvider'

export function CreateProviderPanel() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
  const [searchParams] = useSearchParams()
  const { createProvider, isCreating } = useCreateProvider()

  const [providerType, setProviderType] = useState<ProviderType>('business')
  const [name, setName] = useState('')
  const [nit, setNit] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [rutFile, setRutFile] = useState<File | null>(null)
  const [bankAccountFile, setBankAccountFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Pre-fill from URL params
  useEffect(() => {
    const providerTypeParam = searchParams.get('providerType')
    const nameParam = searchParams.get('name')
    const nitParam = searchParams.get('nit')
    const contactNameParam = searchParams.get('contactName')
    const emailParam = searchParams.get('email')
    const phoneParam = searchParams.get('phone')
    const addressParam = searchParams.get('address')
    if (
      providerTypeParam === 'business' ||
      providerTypeParam === 'natural-person'
    ) {
      setProviderType(providerTypeParam)
    }
    if (nameParam) setName(nameParam)
    if (nitParam) setNit(nitParam)
    if (contactNameParam) setContactName(contactNameParam)
    if (emailParam) setEmail(emailParam)
    if (phoneParam) setPhone(phoneParam)
    if (addressParam) setAddress(addressParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !nit.trim()) {
      setError('Nombre y NIT son requeridos')
      return
    }

    setError(null)

    try {
      // Create provider with files - backend handles everything
      const files: { rut?: File; bankAccount?: File } = {}
      if (rutFile) files.rut = rutFile
      if (bankAccountFile) files.bankAccount = bankAccountFile

      await createProvider(
        {
          providerType,
          name: name.trim(),
          nit: nit.trim(),
          contactName: contactName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
        Object.keys(files).length > 0 ? files : undefined,
      )

      setSuccess(true)
      // Show success briefly, then redirect to providers list
      setTimeout(() => {
        navigate(`/${companyId}/accountancy/providers`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear proveedor')
    }
  }

  const handleClose = () => {
    navigate(`/${companyId}`)
  }

  const isLoading = isCreating

  return (
    <SlidePanel title="Crear proveedor" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
            ✅ Proveedor creado exitosamente
          </div>
        )}

        <div>
          <div className="text-xs text-gray-500 font-medium normal-case">
            Tipo de proveedor *
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            {providerType === 'business' ? '🏢 Empresa' : '👤 Persona Natural'}
          </div>
        </div>

        <Input
          id="name"
          label="Nombre del proveedor *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej: Distribuidora Médica S.A.S."
          autoFocus
          disabled={success}
        />

        <Input
          id="nit"
          label="NIT *"
          value={nit}
          onChange={(e) => setNit(e.target.value)}
          placeholder="ej: 900123456-7"
          disabled={success}
        />

        <Input
          id="contactName"
          label="Nombre del contacto"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="ej: Juan Pérez"
          disabled={success}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ej: contacto@proveedor.com"
          disabled={success}
        />

        <Input
          id="phone"
          label="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="ej: +57 300 1234567"
          disabled={success}
        />

        <Input
          id="address"
          label="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ej: Calle 123 #45-67"
          disabled={success}
        />

        <FileUpload
          label="RUT (opcional)"
          accept=".pdf"
          value={rutFile}
          onChange={setRutFile}
          error={
            rutFile && rutFile.type !== 'application/pdf'
              ? 'Solo archivos PDF'
              : undefined
          }
        />

        <FileUpload
          label="Certificación bancaria (opcional)"
          accept=".pdf"
          value={bankAccountFile}
          onChange={setBankAccountFile}
          error={
            bankAccountFile && bankAccountFile.type !== 'application/pdf'
              ? 'Solo archivos PDF'
              : undefined
          }
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={success}
            className="flex-1"
          >
            Crear proveedor
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </SlidePanel>
  )
}
