import {
  type User as FirebaseUser,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { auth, db } from '../../lib/firebase'
import type { Company, User } from '../../types'

interface AuthContextType {
  user: FirebaseUser | null
  userData: User | null
  company: Company | null
  companyId: string | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const googleProvider = new GoogleAuthProvider()

async function setupUserAndCompany(firebaseUser: FirebaseUser) {
  const defaultCompanyId = 'default-company'

  // Try to get user data
  const userDocRef = doc(
    db,
    'companies',
    defaultCompanyId,
    'users',
    firebaseUser.uid,
  )
  const userDoc = await getDoc(userDocRef)

  let userData: User
  if (userDoc.exists()) {
    userData = { id: userDoc.id, ...userDoc.data() } as User
  } else {
    // Create default user entry
    const newUser: Omit<User, 'id'> = {
      email: firebaseUser.email || '',
      role: 'admin',
      modules: {
        expenses: 'edit',
      },
    }
    await setDoc(userDocRef, newUser)
    userData = { id: firebaseUser.uid, ...newUser }
  }

  // Get or create company
  const companyDocRef = doc(db, 'companies', defaultCompanyId)
  const companyDoc = await getDoc(companyDocRef)

  let company: Company
  if (companyDoc.exists()) {
    company = { id: companyDoc.id, ...companyDoc.data() } as Company
  } else {
    const newCompany = {
      name: 'Mi Empresa',
      createdAt: serverTimestamp(),
      settings: { currency: 'COP' },
    }
    await setDoc(companyDocRef, newCompany)
    company = {
      id: defaultCompanyId,
      ...newCompany,
    } as unknown as Company
  }

  return { userData, company, companyId: defaultCompanyId }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const { userData, company, companyId } =
            await setupUserAndCompany(firebaseUser)
          setUserData(userData)
          setCompany(company)
          setCompanyId(companyId)
        } catch (error) {
          console.error('Error setting up user:', error)
        }
      } else {
        setUserData(null)
        setCompany(null)
        setCompanyId(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
        userData,
        company,
        companyId,
        loading,
        signInWithGoogle,
        signOut,
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
