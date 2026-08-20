import { useCallback, useEffect, useState } from 'react'
import {
  supabase,
  crearInvitacion,
  listarInvitaciones,
  borrarInvitacion,
  suscribirRsvps,
} from '../lib/supabase.js'

const urlDe = (token, lang) => `${window.location.origin}/i/${token}${lang ? `?lang=${lang}` : ''}`
const nombresDe = (inv) => (inv.tipo === 'pareja' ? `${inv.nombre} & ${inv.nombre_pareja}` : inv.nombre)

function mensajeCompartir(inv, lang) {
  const nombres = nombresDe(inv)
  const url = urlDe(inv.token, lang)
  if (lang === 'ro') {
    return inv.tipo === 'pareja'
      ? `Dragi ${nombres}, vă invităm cu drag la nunta noastră (Flo & Bianca), 5 & 8 august 2027. Deschideți invitația voastră aici: ${url}`
      : `Dragă ${nombres}, te invităm cu drag la nunta noastră (Flo & Bianca), 5 & 8 august 2027. Deschide invitația ta aici: ${url}`
  }
  return inv.tipo === 'pareja'
    ? `Hola ${nombres}, nos encantaría que nos acompañarais en nuestra boda (Flo & Bianca), 5 y 8 de agosto de 2027. Abrid vuestra invitación aquí: ${url}`
    : `Hola ${nombres}, nos encantaría que nos acompañaras en nuestra boda (Flo & Bianca), 5 y 8 de agosto de 2027. Abre tu invitación aquí: ${url}`
}

const linkWhatsApp = (inv, lang) => `https://wa.me/?text=${encodeURIComponent(mensajeCompartir(inv, lang))}`

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError('Email o contraseña incorrectos.')
    setEnviando(false)
  }

  return (
    <div className="login">
      <h1>Panel de la boda</h1>
      <form onSubmit={onSubmit}>
        <div className="campo">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="login-pass">Contraseña</label>
          <input
            id="login-pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="rsvp__enviar" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        {error && <p className="aviso aviso--error">{error}</p>}
      </form>
    </div>
  )
}

function estadoDe(inv) {
  const r = inv.rsvps?.[0]
  if (!r) return 'pendiente'
  return r.asiste ? 'si' : 'no'
}

function Panel({ email }) {
  const [lista, setLista] = useState([])
  const [error, setError] = useState(null)
  const [tipo, setTipo] = useState('individual')
  const [nombre, setNombre] = useState('')
  const [nombrePareja, setNombrePareja] = useState('')
  const [creando, setCreando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [dialogo, setDialogo] = useState(null) // { inv, accion: 'copiar' | 'whatsapp' }

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

  const onCrear = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || (tipo === 'pareja' && !nombrePareja.trim())) return
    setCreando(true)
    try {
      await crearInvitacion({ tipo, nombre: nombre.trim(), nombrePareja: nombrePareja.trim() })
      setNombre('')
      setNombrePareja('')
      refrescar()
    } catch {
      setError('No se pudo crear la invitación.')
    } finally {
      setCreando(false)
    }
  }

  const onBorrar = async (inv) => {
    if (!window.confirm(`¿Borrar la invitación de ${nombresDe(inv)}? También se borra su respuesta.`)) return
    try {
      await borrarInvitacion(inv.id)
      refrescar()
    } catch {
      setError('No se pudo borrar la invitación.')
    }
  }

  // Copiar y WhatsApp preguntan primero el idioma; el enlace lleva ?lang=
  // para que la invitación se abra directamente en ese idioma.
  const elegirIdioma = async (lang) => {
    const { inv, accion } = dialogo
    setDialogo(null)
    if (accion === 'copiar') {
      await navigator.clipboard.writeText(urlDe(inv.token, lang))
      setCopiado(inv.id)
      setTimeout(() => setCopiado(null), 1500)
    } else {
      window.open(linkWhatsApp(inv, lang), '_blank', 'noopener')
    }
  }

  const confirmadas = lista.filter((i) => estadoDe(i) === 'si')
  const stats = [
    { num: lista.length, label: 'invitaciones' },
    { num: confirmadas.length, label: 'han dicho sí' },
    { num: lista.filter((i) => estadoDe(i) === 'no').length, label: 'han dicho no' },
    { num: lista.filter((i) => estadoDe(i) === 'pendiente').length, label: 'pendientes' },
    { num: confirmadas.reduce((sum, i) => sum + (i.tipo === 'pareja' ? 2 : 1), 0), label: 'personas confirmadas' },
  ]

  return (
    <div className="admin__inner">
      <div className="admin__head">
        <h1>Panel de la boda</h1>
        <div className="admin__sesion">
          <span className="tabla__detalle">{email}</span>
          <button className="btn-mini" type="button" onClick={() => supabase.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="stats stats--admin">
        {stats.map((s) => (
          <div className="stats__celda" key={s.label}>
            <div className="stats__num">{s.num}</div>
            <div className="stats__label">{s.label}</div>
          </div>
        ))}
      </div>

      <form className="crear" onSubmit={onCrear}>
        <h2>Nueva invitación</h2>
        <div className="crear__fila">
          <div className="campo">
            <label htmlFor="crear-tipo">Tipo</label>
            <select id="crear-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="individual">Individual (Estás invitado)</option>
              <option value="pareja">Pareja (Estáis invitados)</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="crear-nombre">Nombre</label>
            <input
              id="crear-nombre"
              type="text"
              required
              placeholder="p. ej. Dani"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          {tipo === 'pareja' && (
            <div className="campo">
              <label htmlFor="crear-pareja">Su pareja</label>
              <input
                id="crear-pareja"
                type="text"
                required
                placeholder="p. ej. Alejandra"
                value={nombrePareja}
                onChange={(e) => setNombrePareja(e.target.value)}
              />
            </div>
          )}
        </div>
        <button className="rsvp__enviar" type="submit" disabled={creando}>
          {creando ? 'Creando…' : 'Crear enlace'}
        </button>
      </form>

      {error && <p className="aviso aviso--error">{error}</p>}

      <h2 className="admin__subtitulo">Invitaciones creadas</h2>
      {lista.length === 0 ? (
        <p className="aviso aviso--info">Todavía no hay invitaciones. Crea la primera arriba.</p>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Invitados</th>
                <th>Tipo</th>
                <th>Respuesta</th>
                <th>Compartir</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((inv) => {
                const estado = estadoDe(inv)
                const r = inv.rsvps?.[0]
                return (
                  <tr key={inv.id}>
                    <td>
                      <strong>{nombresDe(inv)}</strong>
                      <div className="tabla__detalle">/i/{inv.token}</div>
                    </td>
                    <td>
                      <span className="chip chip--tipo">{inv.tipo}</span>
                    </td>
                    <td>
                      {estado === 'si' && <span className="chip chip--si">Sí</span>}
                      {estado === 'no' && <span className="chip chip--no">No</span>}
                      {estado === 'pendiente' && <span className="chip chip--pend">Pendiente</span>}
                      {r?.restricciones && <div className="tabla__detalle">🍽 {r.restricciones}</div>}
                      {r?.mensaje && <div className="tabla__detalle">💬 {r.mensaje}</div>}
                    </td>
                    <td>
                      <div className="acciones">
                        <button
                          className="btn-mini"
                          type="button"
                          onClick={() => setDialogo({ inv, accion: 'copiar' })}
                        >
                          {copiado === inv.id ? '✓ Copiado' : '🔗 Copiar enlace'}
                        </button>
                        <button
                          className="btn-wa"
                          type="button"
                          onClick={() => setDialogo({ inv, accion: 'whatsapp' })}
                        >
                          <IconoWhatsApp /> Enviar por WhatsApp
                        </button>
                        <button className="btn-mini btn-mini--borrar" type="button" onClick={() => onBorrar(inv)}>
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialogo && (
        <div className="modal" onClick={() => setDialogo(null)}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            <h3>{dialogo.accion === 'copiar' ? 'Copiar enlace' : 'Enviar por WhatsApp'}</h3>
            <p>
              ¿En qué idioma para <strong>{nombresDe(dialogo.inv)}</strong>?
            </p>
            <div className="modal__opciones">
              <button className="rsvp__enviar" type="button" onClick={() => elegirIdioma('ro')}>
                Rumano
              </button>
              <button className="rsvp__enviar" type="button" onClick={() => elegirIdioma('es')}>
                Español
              </button>
            </div>
            <button className="btn-mini" type="button" onClick={() => setDialogo(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [sesion, setSesion] = useState(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setListo(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, nueva) => setSesion(nueva))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <div className="admin">
        <p className="aviso aviso--info">Supabase no está configurado (revisa las variables de entorno).</p>
      </div>
    )
  }

  return <div className="admin">{!listo ? null : sesion ? <Panel email={sesion.user?.email} /> : <Login />}</div>
}
