import { Link } from 'react-router-dom'
import {
  FileText,
  Edit,
  Merge,
  Scissors,
  FileCheck,
  Globe,
  Image,
} from 'lucide-react'

const toolLinks = [
  { path: '/editor', label: 'Editor visual', icon: <Edit size={14} /> },
  { path: '/viewer', label: 'Visor de PDF', icon: <FileText size={14} /> },
  { path: '/merge', label: 'Combinar PDF', icon: <Merge size={14} /> },
  { path: '/split', label: 'Dividir PDF', icon: <Scissors size={14} /> },
  { path: '/filler', label: 'Rellenar formularios', icon: <FileCheck size={14} /> },
  { path: '/htmltopdf', label: 'HTML a PDF', icon: <Globe size={14} /> },
  { path: '/htmltoimage', label: 'HTML a imagen', icon: <Image size={14} /> },
]

const FooterSection = ({ isVisible }) => {
  const visible = isVisible['section-footer']

  return (
    <footer
      id="section-footer"
      style={{
        padding: '4rem 0 2rem',
        marginTop: '2rem',
        background: 'linear-gradient(0deg, rgba(255,73,59,0.03) 0%, transparent 100%)',
      }}
    >
      <div className="container">
        <div className="section-divider" style={{ margin: '0 0 3rem' }} />

        <div className={`animate-fadeInUp stagger-animation ${visible ? 'visible' : ''}`}>
          <div className="footer-grid">
            <div>
              <h4 style={{ fontSize: '1.2rem', textTransform: 'none', letterSpacing: 'normal' }}>
                📄 GoPdfSuit
              </h4>
              <p className="footer-brand-desc">
                Suite de herramientas PDF pensada para usuarios sin conocimientos técnicos.
                Crea, combina y gestiona tus documentos de forma sencilla.
              </p>
            </div>

            <div>
              <h4>Herramientas</h4>
              <div className="footer-links">
                {toolLinks.map(({ path, label, icon }) => (
                  <Link key={path} to={path} className="footer-link">
                    {icon} {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p style={{
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.85rem',
              marginBottom: 0,
              opacity: 0.7,
            }}>
              GoPdfSuit — Herramientas PDF sencillas para todos
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
