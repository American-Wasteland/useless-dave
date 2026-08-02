import { useEffect, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { isUserMemberOfCompany } from '../company/companyService'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, companies, loading, companiesLoaded } = useAuth()
  const { companyId } = useParams<{ companyId: string }>()
  const location = useLocation()
  const [checkingMembership, setCheckingMembership] = useState(false)
  const [isMember, setIsMember] = useState<boolean | null>(null)

  // Check if user is member of the company in URL
  useEffect(() => {
    async function checkMembership() {
      if (!user || !companyId) {
        setIsMember(null)
        return
      }

      setCheckingMembership(true)
      try {
        const memberOfCompany = await isUserMemberOfCompany(user.uid, companyId)
        setIsMember(memberOfCompany)
      } catch (error) {
        console.error('Error checking membership:', error)
        setIsMember(false)
      } finally {
        setCheckingMembership(false)
      }
    }

    checkMembership()
  }, [user, companyId])

  if (loading || checkingMembership || (user && !companiesLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user has no companies, redirect to create company
  if (companies.length === 0) {
    if (location.pathname !== '/create-company') {
      return <Navigate to="/create-company" replace />
    }
    return <>{children}</>
  }

  // If there's a companyId in URL but user is not a member
  if (companyId && isMember === false) {
    return <Navigate to="/select-company" replace />
  }

  // If user has companies but no companyId in URL (and not on special pages)
  const specialPaths = ['/create-company', '/select-company']
  if (!companyId && !specialPaths.includes(location.pathname)) {
    if (companies.length === 1) {
      // Auto-redirect to single company
      return <Navigate to={`/${companies[0].id}`} replace />
    } else {
      // Multiple companies, show selector
      return <Navigate to="/select-company" replace />
    }
  }

  return <>{children}</>
}
