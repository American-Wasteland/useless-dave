const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Request failed: ${response.statusText}`)
  }

  // 204 No Content returns empty response
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
