import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute – wraps any route that requires authentication.
 * If the user is not authenticated, redirects to /login while preserving
 * the intended destination so we can redirect back after login.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
