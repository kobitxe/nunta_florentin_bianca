import { useEffect, useState } from 'react'
import { I18nProvider } from './i18n/index.jsx'
import { buscarInvitadoPorToken } from './lib/supabase.js'
import Carta from './components/Carta.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Detalles from './components/Detalles.jsx'
import Timeline from './components/Timeline.jsx'
import Galeria from './components/Galeria.jsx'
import Rsvp from './components/Rsvp.jsx'
import Footer from './components/Footer.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const ruta = window.location.pathname
  // Invitación personalizada: /i/{token}
  const token = ruta.startsWith('/i/') ? decodeURIComponent(ruta.slice(3).replace(/\/$/, '')) : null

  const [invitado, setInvitado] = useState(null)
  const [cargandoInvitado, setCargandoInvitado] = useState(Boolean(token))

  useEffect(() => {
    if (!token) return
    buscarInvitadoPorToken(token)
      .then(setInvitado)
      .catch(() => setInvitado(null))
      .finally(() => setCargandoInvitado(false))
  }, [token])

  if (ruta === '/admin') return <Admin />

  return (
    <I18nProvider>
      <Carta invitado={invitado} />
      <Navbar />
      <main>
        <Hero invitado={invitado} />
        <Detalles />
        <Timeline />
        <Galeria />
        <Rsvp token={token} invitado={invitado} cargando={cargandoInvitado} />
      </main>
      <Footer />
    </I18nProvider>
  )
}
