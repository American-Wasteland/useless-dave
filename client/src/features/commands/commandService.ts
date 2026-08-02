import type { CommandResult } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function executeCommand(
  commandId: string,
  companyId: string,
  parameters: Record<string, unknown>,
): Promise<CommandResult> {
  const url = `${API_URL}/commands/${commandId}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        ...parameters,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
