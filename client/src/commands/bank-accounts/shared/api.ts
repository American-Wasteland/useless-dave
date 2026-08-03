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

export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Upload failed: ${response.statusText}`)
  }

  return response.json()
}
