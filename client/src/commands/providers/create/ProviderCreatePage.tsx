import type { ProviderType } from '@useless-dave/shared'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, FileUpload, Input } from '../../../components/ui'
import { useCompanyId } from '../../../hooks/useCompanyId'
import { useCreateProvider } from './useCreateProvider'

export function ProviderCreatePage() {
  const navigate = useNavigate()
  const companyId = useCompanyId()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !nit.trim()) {
      setError('Nombre y NIT son requeridos')
      return
    }
    setError(null)
    try {
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
      navigate(`/${companyId}/accountancy/providers`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear proveedor')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link
          to={`/${companyId}/accountancy/providers`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Crear proveedor</h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <div className="text-xs text-gray-500 font-medium normal-case mb-2">
              Tipo de proveedor *
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProviderType('business')}
                className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${
                  providerType === 'business'
                    ? 'bg-primary-100 text-primary-900 border-2 border-primary-500'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                🏢 Empresa
              </button>
              <button
                type="button"
                onClick={() => setProviderType('natural-person')}
                className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${
                  providerType === 'natural-person'
                    ? 'bg-primary-100 text-primary-900 border-2 border-primary-500'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                👤 Persona Natural
              </button>
            </div>
          </div>

          <Input
            id="name"
            label="Nombre del proveedor *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Distribuidora Médica S.A.S."
            autoFocus
          />

          <Input
            id="nit"
            label="NIT *"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            placeholder="ej: 900123456-7"
          />

          <Input
            id="contactName"
            label="Nombre del contacto (opcional)"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="ej: Juan Pérez"
          />

          <Input
            id="email"
            label="Email (opcional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej: contacto@proveedor.com"
          />

          <Input
            id="phone"
            label="Teléfono (opcional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ej: +57 300 1234567"
          />

          <Input
            id="address"
            label="Dirección (opcional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ej: Calle 123 #45-67"
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
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Crear proveedor
            </Button>
            <Link
              to={`/${companyId}/accountancy/providers`}
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
