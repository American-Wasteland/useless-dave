import type { CommandDefinition } from '../../../features/commands/commandRegistry'

export const createProviderCommand: CommandDefinition = {
  id: 'create-provider',
  name: '/crear-proveedor',
  description: 'Crear un nuevo proveedor',
  icon: '🏢',
  targetPath: '/accountancy/providers?modal=provider&mode=create',
  parameters: [
    {
      name: 'providerType',
      label: 'Tipo de proveedor',
      type: 'select',
      required: true,
      options: [
        { value: 'business', label: 'Empresa' },
        { value: 'natural-person', label: 'Persona Natural' },
      ],
    },
    {
      name: 'name',
      label: 'Nombre del proveedor',
      type: 'text',
      required: true,
      placeholder: 'ej: Distribuidora Médica S.A.S.',
    },
    {
      name: 'nit',
      label: 'NIT',
      type: 'text',
      required: true,
      placeholder: 'ej: 900123456-7',
    },
    {
      name: 'contactName',
      label: 'Nombre del contacto (opcional)',
      type: 'text',
      required: false,
      placeholder: 'ej: Juan Pérez',
    },
    {
      name: 'email',
      label: 'Email (opcional)',
      type: 'text',
      required: false,
      placeholder: 'ej: contacto@proveedor.com',
    },
    {
      name: 'phone',
      label: 'Teléfono (opcional)',
      type: 'text',
      required: false,
      placeholder: 'ej: +57 300 1234567',
    },
    {
      name: 'address',
      label: 'Dirección (opcional)',
      type: 'text',
      required: false,
      placeholder: 'ej: Calle 123 #45-67',
    },
  ],
}
