import { I18nProvider } from './i18n/index.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Detalles from './components/Detalles.jsx'
import Timeline from './components/Timeline.jsx'
import Galeria from './components/Galeria.jsx'
import Rsvp from './components/Rsvp.jsx'
import Stats from './components/Stats.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <I18nProvider>
      <Navbar />
      <main>
        <Hero />
        <Detalles />
        <Timeline />
        <Galeria />
        <Rsvp />
        <Stats />
      </main>
      <Footer />
    </I18nProvider>
  )
}
