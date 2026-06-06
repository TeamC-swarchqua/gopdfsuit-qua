import { Link } from 'react-router-dom'
import {
  FileText,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const HeroSection = () => {
  return (
    <section
      id="section-hero"
      className="hero-section"
      style={{ padding: '6rem 0 4rem', textAlign: 'center' }}
    >
      <div className="container">
        <div className="hero-badge animate-fadeInUp">
          <Sparkles size={16} />
          Herramientas PDF para el día a día
        </div>

        <h1
          className="hero-title gradient-text animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          GoPdfSuit
        </h1>

        <div
          className="hero-subtitle animate-fadeInUp"
          style={{
            marginBottom: '3rem',
            animationDelay: '0.2s',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <p className="hero-description">
            Crea, combina, divide y rellena documentos PDF de forma sencilla.
            Ideal para profesores, administrativos y cualquier persona que trabaje con archivos PDF.
          </p>

          <div className="hero-pills-container">
            <div className="hero-pills-row">
              <span className="row-label">Funciones</span>
              {['Crear PDF', 'Combinar archivos', 'Dividir páginas', 'Rellenar formularios'].map((feature, i) => (
                <span key={i} className="hero-pill">
                  <CheckCircle size={14} />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-cta-group animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <Link
            to="/editor"
            className="btn-glow glow-on-hover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              fontSize: '1.15rem',
              padding: '1.1rem 2.8rem',
            }}
          >
            <FileText size={22} />
            Crear un PDF
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      <div
        className="scroll-indicator"
        onClick={() => document.getElementById('section-features')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <ChevronDown size={32} color="var(--accent-primary)" />
      </div>
    </section>
  )
}

export default HeroSection
