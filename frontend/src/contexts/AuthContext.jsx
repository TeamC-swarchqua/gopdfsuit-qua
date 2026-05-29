import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { apiConfig } from '../utils/apiConfig'

const AuthContext = createContext()

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

function useAuthState() {
  // Inicialización síncrona desde localStorage (lazy initializer).
  // Esto evita el parpadeo de AuthGuard: en el primer render ya tiene
  // el estado correcto, sin esperar a un useEffect post-montaje.
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(USER_KEY))
  )

  // Ref to a navigate function injected by the router (set from outside).
  // We use a ref so the callbacks don't need to close over it as a dep.
  const navigateRef = useRef(null)

  const persist = useCallback((newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    setIsAuthenticated(true)

    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    // Navigate to login if we have a navigate function available
    if (navigateRef.current) {
      navigateRef.current('/login', { replace: true })
    }
  }, [])

  // submit posts credentials to auth-ms and stores the returned JWT.
  const submit = useCallback(async (path, email, password) => {
    const res = await fetch(`${apiConfig.authUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    let data = {}

    try {
      data = await res.json()
    } catch {
      // non-JSON response
    }

    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed')
    }

    persist(data.token, data.user)

    return data
  }, [persist])

  const login = useCallback(
    (email, password) => submit('/auth/login', email, password),
    [submit]
  )

  const register = useCallback(
    (email, password) => submit('/auth/register', email, password),
    [submit]
  )

  const getAuthHeaders = useCallback(() => {
    if (!token) {
      throw new Error('Not authenticated')
    }

    return { Authorization: `Bearer ${token}` }
  }, [token])

  // setNavigate allows the router-aware component to inject a navigate fn
  // so logout can redirect without coupling the context to react-router.
  const setNavigate = useCallback((fn) => {
    navigateRef.current = fn
  }, [])

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,

    // On a 401/403, callers can trigger a forced logout → redirect to /login
    triggerLogin: logout,

    getAuthHeaders,
    setNavigate,
  }
}

export function AppAuthProvider({ children }) {
  const auth = useAuthState()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}