import { useState, useEffect } from 'react'
import { hasWelcomeBeenShown, markWelcomeShown } from '../utils/userDisplay'

const AUTO_HIDE_MS = 5000

/**
 * Lazo diagonal "nuevo" en la esquina superior izquierda.
 * Aparece la primera vez que el usuario entra en la página de inicio
 * y se oculta automáticamente tras unos segundos.
 */
const WelcomeBanner = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (hasWelcomeBeenShown()) return

    setVisible(true)
    markWelcomeShown()

    const hideTimer = setTimeout(() => setVisible(false), AUTO_HIDE_MS)
    return () => clearTimeout(hideTimer)
  }, [])

  if (!visible) return null

  return (
    <div className="welcome-ribbon" role="status" aria-live="polite">
      <span className="welcome-ribbon-band">nuevo</span>
    </div>
  )
}

export default WelcomeBanner
