import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileText, Edit, Merge, FileCheck, Globe, Image, Menu, X, Sun, Moon, LogOut, Scissors, Eraser } from 'lucide-react'
import { useTheme } from '../theme'
import { useAuth } from '../contexts/AuthContext'
import { getUserDisplayName } from '../utils/userDisplay'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, setNavigate } = useAuth()

  setNavigate(navigate)

  if (location.pathname === '/login') return null

  const isNavItemActive = (path) => {
    const [pathname] = path.split('?')
    return location.pathname === pathname
  }

  const navItems = [
    { path: '/', label: 'Inicio', icon: FileText },
    { path: '/viewer', label: 'Visor', icon: FileText },
    { path: '/editor', label: 'Editor', icon: Edit },
    { path: '/merge', label: 'Combinar', icon: Merge },
    { path: '/split', label: 'Dividir', icon: Scissors },
    { path: '/filler', label: 'Rellenar', icon: FileCheck },
    { path: '/htmltopdf', label: 'HTML a PDF', icon: Globe },
    { path: '/htmltoimage', label: 'HTML a imagen', icon: Image },
    { path: '/redact', label: 'Ocultar', icon: Eraser },
  ]

  const displayName = getUserDisplayName(user)

  return (
    <nav className="navbar" style={{ padding: '0.75rem 0' }}>
      <div className="container-full">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'hsl(var(--foreground))',
              textDecoration: 'none',
              fontSize: '1.5rem',
              fontWeight: '700',
              lineHeight: '1',
              marginRight: '1rem',
            }}
          >
            <span style={{ verticalAlign: 'middle', fontSize: '1.5rem' }}>📄</span> GoPdfSuit
          </Link>

          <div style={{
            display: 'flex',
            gap: '0.25rem',
            alignItems: 'center',
          }} className="desktop-menu">
            {navItems.slice(1).map(({ path, label, icon: Icon }) => {
              const active = isNavItemActive(path)
              return (
                <Link
                  key={path}
                  to={path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: active ? 'var(--secondary-color)' : 'hsl(var(--muted-foreground))',
                    textDecoration: 'none',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem',
                    background: active ? 'color-mix(in hsl, var(--secondary-color) 15%, transparent)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'hsl(var(--accent))'
                      e.currentTarget.style.color = 'hsl(var(--accent-foreground))'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                    }
                  }}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}

            <button
              onClick={toggle}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{
                background: 'transparent',
                border: '1px solid hsl(var(--border))',
                padding: '0.3rem 0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'hsl(var(--foreground))',
                transition: 'all 0.3s ease',
                marginLeft: '0.25rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'hsl(var(--accent))'
                e.currentTarget.style.color = 'hsl(var(--accent-foreground))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'hsl(var(--foreground))'
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated && user && (
              <>
                <div
                  title={user.email}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    maxWidth: '160px',
                    marginLeft: '0.25rem'
                  }}>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'hsl(var(--foreground))',
                      lineHeight: '1.2',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {displayName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'hsl(var(--destructive))',
                    color: 'hsl(var(--destructive-foreground))',
                    border: '1px solid hsl(var(--border))',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'hsl(var(--foreground))',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="mobile-menu-button"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '1rem',
            background: 'hsl(var(--card))',
            borderRadius: '8px',
          }} className="mobile-menu">
            {navItems.slice(1).map(({ path, label, icon: Icon }) => {
              const active = isNavItemActive(path)
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: active ? 'var(--secondary-color)' : 'hsl(var(--muted-foreground))',
                    textDecoration: 'none',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    background: active ? 'color-mix(in hsl, var(--secondary-color) 15%, transparent)' : 'transparent',
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}

            <button
              onClick={toggle}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{
                background: 'transparent',
                border: '1px solid hsl(var(--border))',
                padding: '0.6rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'hsl(var(--foreground))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-muted">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>

            {isAuthenticated && user && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'hsl(var(--foreground))'
                    }}>
                      {displayName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'hsl(var(--destructive))',
                    color: 'hsl(var(--destructive-foreground))',
                    border: '1px solid hsl(var(--border))',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar
