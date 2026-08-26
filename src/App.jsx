import { useEffect, useState } from 'react'
import { I18nProvider } from './i18n/index.jsx'
import { buscarInvitadoPorToken } from './lib/supabase.js'
import Carta from './components/Carta.jsx'
import Idiomas from './components/Idiomas.jsx'
import Hero from './components/Hero.jsx'
import IntroCita from './components/IntroCita.jsx'
import Familia from './components/Familia.jsx'
import Contador from './components/Contador.jsx'
import Detalles from './components/Detalles.jsx'
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

  // Sin token (URL base) o token que no corresponde a ninguna invitación:
  // no se deja pasar. cargandoInvitado evita el falso "denegado" mientras
  // la búsqueda del token todavía está en curso.
  const denegado = !cargandoInvitado && !invitado

  return (
    <I18nProvider invitado={invitado}>
      <Carta invitado={invitado} token={token} denegado={denegado} />
      <Idiomas variante={invitado?.variante ?? 'sin_misa'} />
      <main>
        <Hero invitado={invitado} />
        <IntroCita />
        <Familia />
        <Contador />
        <Detalles invitado={invitado} />
        <Rsvp token={token} invitado={invitado} cargando={cargandoInvitado} />
      </main>
      <Footer />
    </I18nProvider>
  )
}
