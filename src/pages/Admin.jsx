import { useCallback, useEffect, useState } from 'react'
import {
  supabase,
  crearInvitacion,
  listarInvitaciones,
  borrarInvitacion,
  suscribirRsvps,
} from '../lib/supabase.js'

const urlDe = (token) => `${window.location.origin}/i/${token}`
const nombresDe = (inv) => (inv.tipo === 'pareja' ? `${inv.nombre} & ${inv.nombre_pareja}` : inv.nombre)

function mensajeCompartir(inv, lang) {
  const nombres = nombresDe(inv)
  const url = urlDe(inv.token)
  if (lang === 'ro') {
    return inv.tipo === 'pareja'
      ? `Dragi ${nombres}, vă invităm cu drag la nunta noastră — Flo & Bianca, 5 & 8 august 2027. Deschideți invitația voastră aici: ${url}`
      : `Dragă ${nombres}, te invităm cu drag la nunta noastră — Flo & Bianca, 5 & 8 august 2027. Deschide invitația ta aici: ${url}`
  }
  return inv.tipo === 'pareja'
    ? `Hola ${nombres}, nos encantaría que nos acompañarais en nuestra boda — Flo & Bianca, 5 y 8 de agosto de 2027. Abrid vuestra invitación aquí: ${url}`
    : `Hola ${nombres}, nos encantaría que nos acompañaras en nuestra boda — Flo & Bianca, 5 y 8 de agosto de 2027. Abre tu invitación aquí: ${url}`
}

const linkWhatsApp = (inv, lang) => `https://wa.me/?text=${encodeURIComponent(mensajeCompartir(inv, lang))}`

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

  const copiar = async (inv) => {
    await navigator.clipboard.writeText(urlDe(inv.token))
    setCopiado(inv.id)
    setTimeout(() => setCopiado(null), 1500)
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
                        <button className="btn-mini" type="button" onClick={() => copiar(inv)}>
                          {copiado === inv.id ? '✓ Copiado' : 'Copiar enlace'}
                        </button>
                        <a className="btn-mini" href={linkWhatsApp(inv, 'ro')} target="_blank" rel="noreferrer">
                          WhatsApp RO
                        </a>
                        <a className="btn-mini" href={linkWhatsApp(inv, 'es')} target="_blank" rel="noreferrer">
                          WhatsApp ES
                        </a>
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
