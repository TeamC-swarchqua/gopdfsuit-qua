import { Link } from 'react-router-dom'
import { Transition } from '@headlessui/react'
import {
  FileText,
  Edit,
  Merge,
  FileCheck,
  Globe,
  Image,
  Scissors,
  Eraser,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: <FileText size={24} />,
    title: 'Visor de PDF',
    description: 'Abre plantillas y genera documentos PDF listos para descargar.',
    link: '/viewer',
    color: 'orange',
  },
  {
    icon: <Edit size={24} />,
    title: 'Editor visual',
    description: 'Diseña tus documentos arrastrando elementos sobre la página.',
    link: '/editor',
    color: 'orange',
  },
  {
    icon: <Merge size={24} />,
    title: 'Combinar PDF',
    description: 'Une varios archivos PDF en uno solo, en el orden que elijas.',
    link: '/merge',
    color: 'orange',
  },
  {
    icon: <Scissors size={24} />,
    title: 'Dividir PDF',
    description: 'Separa un PDF en partes más pequeñas según las páginas que indiques.',
    link: '/split',
    color: 'orange',
  },
  {
    icon: <FileCheck size={24} />,
    title: 'Rellenar formularios',
    description: 'Completa automáticamente los campos de un formulario PDF.',
    link: '/filler',
    color: 'orange',
  },
  {
    icon: <Globe size={24} />,
    title: 'HTML a PDF',
    description: 'Convierte una página web o contenido HTML en un archivo PDF.',
    link: '/htmltopdf',
    color: 'orange',
  },
  {
    icon: <Image size={24} />,
    title: 'HTML a imagen',
    description: 'Genera una imagen a partir de contenido HTML o una página web.',
    link: '/htmltoimage',
    color: 'orange',
  },
  {
    icon: <Eraser size={24} />,
    title: 'Ocultar información',
    description: 'Tapar datos sensibles en un PDF antes de compartirlo.',
    link: '/redact',
    color: 'orange',
  },
]

const FeatureCard = ({ feature }) => (
  <div className="glass-card feature-card-inner">
    <div className="feature-card-content">
      <div className="feature-card-header">
        <div
          className={`feature-icon-box ${feature.color}`}
          style={{ width: '48px', height: '48px' }}
        >
          {feature.icon}
        </div>
        <h3>{feature.title}</h3>
      </div>
      <p className="feature-card-desc">{feature.description}</p>
      <div className="feature-card-link">
        Probar ahora
        <ArrowRight size={14} />
      </div>
    </div>
  </div>
)

const FeaturesSection = ({ isVisible }) => {
  const visible = isVisible['section-features']

  return (
    <section id="section-features" style={{ padding: '5rem 0' }}>
      <div className="container">
        <Transition
          as="div"
          show={!!visible}
          enter="animate-fadeInUp"
          enterFrom="stagger-animation"
          enterTo="stagger-animation visible"
          className="text-center"
          style={{ marginBottom: '3rem' }}
        >
          <h2 className="gradient-text section-heading">
            ¿Qué puedes hacer?
          </h2>
          <p className="section-subheading">
            Todas las herramientas que necesitas para trabajar con PDF de forma sencilla
          </p>
        </Transition>

        <div className="bento-features">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Transition
                as="div"
                show={!!visible}
                enter="animate-fadeInScale"
                enterFrom="stagger-animation"
                enterTo="stagger-animation visible"
                style={{ animationDelay: `${0.1 + index * 0.06}s` }}
              >
                <FeatureCard feature={feature} />
              </Transition>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
