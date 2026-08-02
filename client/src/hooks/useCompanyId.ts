import { useParams } from 'react-router-dom'

/**
 * Hook to get the current company ID from URL params.
 * Use this in any component that needs the active company context.
 */
export function useCompanyId(): string | undefined {
  const { companyId } = useParams<{ companyId: string }>()
  return companyId
}
