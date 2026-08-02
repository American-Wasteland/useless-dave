import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Company } from '../../types'
import {
  getCompany,
  getUserCompanies,
  isUserMemberOfCompany,
} from './companyService'

interface CompanyContextType {
  companies: Company[]
  activeCompany: Company | null
  loading: boolean
  error: string | null
  setActiveCompany: (company: Company) => void
  refreshCompanies: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

interface CompanyProviderProps {
  children: ReactNode
  userId: string | null
}

export function CompanyProvider({ children, userId }: CompanyProviderProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()

  const refreshCompanies = useCallback(async () => {
    if (!userId) {
      setCompanies([])
      setActiveCompanyState(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userCompanies = await getUserCompanies(userId)
      setCompanies(userCompanies)

      // If there's a companyId in the URL, validate and set it
      if (companyId) {
        const isMember = await isUserMemberOfCompany(userId, companyId)
        if (isMember) {
          const company = await getCompany(companyId)
          if (company) {
            setActiveCompanyState(company)
          } else {
            setError('Empresa no encontrada')
          }
        } else {
          setError('No tienes acceso a esta empresa')
        }
      } else if (userCompanies.length === 1) {
        // Auto-select if only one company
        setActiveCompanyState(userCompanies[0])
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
      setError('Error al cargar empresas')
    } finally {
      setLoading(false)
    }
  }, [userId, companyId])

  useEffect(() => {
    refreshCompanies()
  }, [refreshCompanies])

  const setActiveCompany = useCallback(
    (company: Company) => {
      setActiveCompanyState(company)
      // Navigate to company's root if not already in its context
      if (!window.location.pathname.startsWith(`/${company.id}`)) {
        navigate(`/${company.id}`)
      }
    },
    [navigate],
  )

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        loading,
        error,
        setActiveCompany,
        refreshCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}
