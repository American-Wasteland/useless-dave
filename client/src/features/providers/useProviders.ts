import { useCallback, useEffect, useState } from 'react'
import type { Provider } from '../../types'
import { useAuth } from '../auth'
import { getProviders } from './providerService'

export function useProviders() {
  const { companyId } = useAuth()
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProviders = useCallback(async () => {
    if (!companyId) return

    setIsLoading(true)
    try {
      const data = await getProviders(companyId)
      setProviders(data)
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  return { providers, isLoading, refetch: fetchProviders }
}
