import { useCallback, useEffect, useState } from 'react'
import { supabase, listarInvitaciones, suscribirRsvps } from '../../lib/supabase.js'
import Sidebar from './Sidebar.jsx'
import Inicio from './Inicio.jsx'
import Invitaciones from './Invitaciones.jsx'
import Respuestas from './Respuestas.jsx'

export default function Panel({ email }) {
  const [lista, setLista] = useState([])
  const [error, setError] = useState(null)
  const [seccion, setSeccion] = useState('inicio')

  const refrescar = useCallback(() => {
    listarInvitaciones()
      .then((datos) => {
        setLista(datos)
        setError(null)
      })
      .catch(() => setError('No se pudo cargar la lista. ¿Ejecutaste la migración SQL?'))
  }, [])

  useEffect(() => {
    refrescar()
    return suscribirRsvps(refrescar)
  }, [refrescar])

  return (
    <div className="admin-layout">
      <Sidebar
        seccion={seccion}
        onCambiarSeccion={setSeccion}
        email={email}
        onCerrarSesion={() => supabase.auth.signOut()}
      />
      <main className="admin-main">
        {error && <p className="aviso aviso--error">{error}</p>}
        {seccion === 'inicio' && <Inicio lista={lista} />}
        {seccion === 'invitaciones' && <Invitaciones lista={lista} refrescar={refrescar} />}
        {seccion === 'respuestas' && <Respuestas lista={lista} />}
      </main>
    </div>
  )
}
