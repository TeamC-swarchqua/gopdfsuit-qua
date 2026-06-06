/** Deriva un nombre legible a partir del correo del usuario. */
export function getUserDisplayName(user) {
  if (!user?.email) return ''
  const local = user.email.split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, ' ')
}

/** Clave de sessionStorage para el lazo "nuevo" en la página de inicio. */
const WELCOME_KEY = 'home_welcome_shown'

/** Indica si el mensaje "nuevo" ya se mostró en esta sesión. */
export function hasWelcomeBeenShown() {
  return sessionStorage.getItem(WELCOME_KEY) === 'true'
}

/** Marca el mensaje "nuevo" como mostrado en esta sesión. */
export function markWelcomeShown() {
  sessionStorage.setItem(WELCOME_KEY, 'true')
}
