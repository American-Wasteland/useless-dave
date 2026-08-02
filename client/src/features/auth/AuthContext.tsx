import {
  type User as FirebaseUser,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { auth, db } from '../../lib/firebase'
import type { Company } from '../../types'
import { getUserCompanies } from '../company/companyService'

interface AuthContextType {
  user: FirebaseUser | null
  companies: Company[]
  loading: boolean
  companiesLoaded: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshCompanies: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [companiesLoaded, setCompaniesLoaded] = useState(false)

  const fetchCompanies = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      console.log('Fetching companies for user:', firebaseUser.uid)

      // Ensure user document exists
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      console.log('Updating user doc...')
      await setDoc(
        userDocRef,
        {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          updatedAt: new Date(),
        },
        { merge: true },
      )
      console.log('User doc updated, fetching companies...')

      const userCompanies = await getUserCompanies(firebaseUser.uid)
      console.log('Companies fetched:', userCompanies.length)
      setCompanies(userCompanies)
      setCompaniesLoaded(true)
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
    }
  }, [])

  const refreshCompanies = async () => {
    if (user) {
      await fetchCompanies(user)
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await fetchCompanies(firebaseUser)
        setLoading(false)
      } else {
        setUser(null)
        setCompanies([])
        setCompaniesLoaded(false)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [fetchCompanies])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      throw new Error(err.message || 'Sign-in failed')
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        companies,
        loading,
        companiesLoaded,
        signInWithGoogle,
        signOut,
        refreshCompanies,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
