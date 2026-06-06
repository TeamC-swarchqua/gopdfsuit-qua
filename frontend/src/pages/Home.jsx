import BackgroundAnimation from '../components/BackgroundAnimation'
import WelcomeBanner from '../components/WelcomeBanner'
import { useScrollAnimation } from '../utils/useScrollAnimation'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import FooterSection from '../components/home/FooterSection'

const Home = () => {
  const isVisible = useScrollAnimation()

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <WelcomeBanner />
      <BackgroundAnimation />
      <HeroSection />
      <FeaturesSection isVisible={isVisible} />
      <FooterSection isVisible={isVisible} />
    </div>
  )
}

export default Home
