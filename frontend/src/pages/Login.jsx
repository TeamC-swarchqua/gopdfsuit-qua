import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BackgroundAnimation from '../components/BackgroundAnimation'

export default function LoginPage() {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Destination the user originally tried to reach (set by AuthGuard)
  const from = location.state?.from?.pathname || '/'

  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  // If already authenticated, redirect to the originally requested route
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setBusy(true)
    try {
      if (tab === 'login') {
        await login(email, password)
        // navigate happens via the useEffect above once isAuthenticated flips
      } else {
        await register(email, password)
        setSuccess('Cuenta creada exitosamente. Iniciando sesión…')
      }
    } catch (err) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <BackgroundAnimation />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px', padding: '1rem' }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '2rem',
            fontWeight: '800',
            color: 'hsl(var(--foreground))',
            marginBottom: '0.5rem',
          }}>
            <span style={{ fontSize: '2.2rem' }}>📄</span>
            <span style={{
              background: 'linear-gradient(135deg, #ff493b 0%, #ff6b35 50%, #ff8560 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>GoPdfSuit</span>
          </div>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem', margin: 0 }}>
            Suite de herramientas PDF profesional
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.75rem',
            gap: '4px',
          }}>
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.25s ease',
                  background: tab === t
                    ? 'linear-gradient(135deg, rgba(255,73,59,0.25) 0%, rgba(255,107,53,0.25) 100%)'
                    : 'transparent',
                  color: tab === t ? '#ff493b' : 'hsl(var(--muted-foreground))',
                  borderBottom: tab === t ? '2px solid #ff493b' : '2px solid transparent',
                }}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
              {tab === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta nueva'}
            </h1>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', margin: 0 }}>
              {tab === 'login'
                ? 'Ingresa tus credenciales para acceder a las herramientas'
                : 'Regístrate para empezar a usar GoPdfSuit'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} data-testid="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="auth-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'hsl(var(--foreground))' }}>
                Usuario o email
              </label>
              <input
                id="auth-email"
                data-testid="auth-email"
                type="text"
                autoComplete="username"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={busy}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '0.95rem',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff493b'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            <div>
              <label htmlFor="auth-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'hsl(var(--foreground))' }}>
                Contraseña
              </label>
              <input
                id="auth-password"
                data-testid="auth-password"
                type="password"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={busy}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '0.95rem',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff493b'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            {/* Feedback */}
            {error && (
              <div data-testid="auth-error" role="alert" style={{
                padding: '0.65rem 0.9rem',
                background: 'rgba(255,80,80,0.1)',
                border: '1px solid rgba(255,80,80,0.3)',
                borderRadius: '8px',
                color: '#ff6b6b',
                fontSize: '0.875rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div role="status" style={{
                padding: '0.65rem 0.9rem',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '8px',
                color: '#10b981',
                fontSize: '0.875rem',
              }}>
                ✅ {success}
              </div>
            )}

            {/* Submit */}
            <button
              data-testid={tab === 'login' ? 'auth-login' : 'auth-register'}
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: busy
                  ? 'rgba(255,73,59,0.4)'
                  : 'linear-gradient(135deg, #ff493b 0%, #ff6b35 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: busy ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: busy ? 'none' : '0 4px 15px rgba(255,73,59,0.35)',
                marginTop: '0.25rem',
              }}
              onMouseEnter={(e) => { if (!busy) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {busy
                ? '⏳ Procesando…'
                : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>

          {/* Switch tab hint */}
          <p style={{ textAlign: 'center', marginTop: '1.25rem', marginBottom: 0, fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
            {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
              style={{ background: 'none', border: 'none', color: '#ff493b', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', padding: 0 }}
            >
              {tab === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>
        </div>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {['🔒 Seguro', '⚡ Rápido', '📑 Editor PDF', '🔗 Combinar y dividir'].map((badge) => (
            <span key={badge} style={{
              padding: '0.3rem 0.7rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50px',
              fontSize: '0.75rem',
              color: 'hsl(var(--muted-foreground))',
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
