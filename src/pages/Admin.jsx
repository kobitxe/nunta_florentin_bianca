import { useCallback, useEffect, useState } from 'react'
import {
  supabase,
  crearInvitacion,
  listarInvitaciones,
  borrarInvitacion,
  fijarAsistencia,
  suscribirRsvps,
} from '../lib/supabase.js'

const urlDe = (token, lang) => `${window.location.origin}/i/${token}${lang ? `?lang=${lang}` : ''}`
const nombresDe = (inv) => (inv.tipo === 'pareja' ? `${inv.nombre} & ${inv.nombre_pareja}` : inv.nombre)

const IDIOMAS_LABEL = { ro: 'Rumano', es: 'Español', ru: 'Ruso' }
const IDIOMAS_POR_VARIANTE = { sin_misa: ['ro', 'es'], con_misa: ['ro', 'ru', 'es'] }

function mensajeCompartir(inv, lang) {
  const nombres = nombresDe(inv)
  const url = urlDe(inv.token, lang)
  if (lang === 'ro') {
    return inv.tipo === 'pareja'
      ? `Dragi ${nombres}, vă invităm cu drag la nunta noastră (Bianca & Florentin), 8 august 2027. Deschideți invitația voastră aici: ${url}`
      : `Dragă ${nombres}, te invităm cu drag la nunta noastră (Bianca & Florentin), 8 august 2027. Deschide invitația ta aici: ${url}`
  }
  if (lang === 'ru') {
    return inv.tipo === 'pareja'
      ? `Дорогие ${nombres}, приглашаем вас на нашу свадьбу (Bianca & Florentin), 8 августа 2027 года. Откройте своё приглашение здесь: ${url}`
      : `Дорогой(ая) ${nombres}, приглашаем тебя на нашу свадьбу (Bianca & Florentin), 8 августа 2027 года. Открой своё приглашение здесь: ${url}`
  }
  return inv.tipo === 'pareja'
    ? `Hola ${nombres}, nos encantaría que nos acompañarais en nuestra boda (Bianca & Florentin), 8 de agosto de 2027. Abrid vuestra invitación aquí: ${url}`
    : `Hola ${nombres}, nos encantaría que nos acompañaras en nuestra boda (Bianca & Florentin), 8 de agosto de 2027. Abre tu invitación aquí: ${url}`
}

const linkWhatsApp = (inv, lang) => `https://wa.me/?text=${encodeURIComponent(mensajeCompartir(inv, lang))}`

// Popup genérico "¿en qué idioma?", reutilizado tanto para compartir un
// enlace ya creado como para elegir el idioma al crear una invitación
// "con misa" (antes de guardarla).
function ModalIdioma({ titulo, pregunta, idiomas, onElegir, onCancelar }) {
  return (
    <div className="modal" onClick={onCancelar}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <p>{pregunta}</p>
        <div className="modal__opciones">
          {idiomas.map((cod) => (
            <button key={cod} className="rsvp__enviar" type="button" onClick={() => onElegir(cod)}>
              {IDIOMAS_LABEL[cod]}
            </button>
          ))}
        </div>
        <button className="btn-mini" type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
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

// Desde que rsvps.invitado_id tiene restricción unique (migration-004),
// PostgREST embebe la relación como objeto ("uno a uno") en vez de lista;
// esto acepta las dos formas por si el caché de esquema de Supabase tarda
// en refrescarse tras el cambio.
function primerRsvp(inv) {
  const r = inv.rsvps
  if (!r) return null
  return Array.isArray(r) ? (r[0] ?? null) : r
}

function estadoDe(inv) {
  const r = primerRsvp(inv)
  if (!r) return 'pendiente'
  return r.asiste ? 'si' : 'no'
}

function Panel({ email }) {
  const [lista, setLista] = useState([])
  const [error, setError] = useState(null)
  const [tipo, setTipo] = useState('individual')
  const [variante, setVariante] = useState('sin_misa')
  const [nombre, setNombre] = useState('')
  const [nombrePareja, setNombrePareja] = useState('')
  const [creando, setCreando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [dialogo, setDialogo] = useState(null) // { inv, accion: 'copiar' | 'whatsapp' }
  const [crearPendiente, setCrearPendiente] = useState(null) // datos del formulario a falta del idioma
  const [menuAbierto, setMenuAbierto] = useState(null) // id de la invitación con el menú de acciones abierto

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

  // Cierra el menú de "más acciones" al pulsar fuera de él.
  useEffect(() => {
    if (!menuAbierto) return
    const onClickFuera = (e) => {
      if (!e.target.closest('.inv-card__menu-wrap')) setMenuAbierto(null)
    }
    document.addEventListener('click', onClickFuera)
    return () => document.removeEventListener('click', onClickFuera)
  }, [menuAbierto])

  const ejecutarCreacion = async (datos) => {
    setCreando(true)
    try {
      await crearInvitacion(datos)
      setNombre('')
      setNombrePareja('')
      setVariante('sin_misa')
      refrescar()
    } catch (err) {
      setError(`No se pudo crear la invitación.${err?.message ? ` (${err.message})` : ''}`)
    } finally {
      setCreando(false)
    }
  }

  const onCrear = (e) => {
    e.preventDefault()
    if (!nombre.trim() || (tipo === 'pareja' && !nombrePareja.trim())) return
    setCrearPendiente({ tipo, nombre: nombre.trim(), nombrePareja: nombrePareja.trim(), variante })
  }

  const elegirIdiomaCreacion = async (lang) => {
    const datos = crearPendiente
    setCrearPendiente(null)
    await ejecutarCreacion({ ...datos, idioma: lang })
  }

  const onBorrar = async (inv) => {
    if (!window.confirm(`¿Borrar la invitación de ${nombresDe(inv)}? También se borra su respuesta.`)) return
    try {
      await borrarInvitacion(inv.id)
      refrescar()
    } catch (err) {
      setError(`No se pudo borrar la invitación.${err?.message ? ` (${err.message})` : ''}`)
    }
  }

  const onEstado = async (inv, estado) => {
    try {
      await fijarAsistencia(inv, estado)
      refrescar()
    } catch (err) {
      setError(`No se pudo cambiar el estado.${err?.message ? ` (${err.message})` : ''}`)
    }
  }

  // Copiar y WhatsApp preguntan primero el idioma; el enlace lleva ?lang=
  // para que la invitación se abra directamente en ese idioma. No cambia
  // el idioma guardado del invitado, solo el del enlace puntual.
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
            <label htmlFor="crear-variante">Invitación</label>
            <select id="crear-variante" value={variante} onChange={(e) => setVariante(e.target.value)}>
              <option value="sin_misa">Sin Misa</option>
              <option value="con_misa">Con Misa</option>
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
        <ul className="lista-inv">
          {lista.map((inv) => {
            const estado = estadoDe(inv)
            const r = primerRsvp(inv)
            return (
              <li className="inv-card" key={inv.id}>
                <div className="inv-card__top">
                  <strong className="inv-card__nombre">{nombresDe(inv)}</strong>
                  <span className="chip chip--tipo">{inv.tipo}</span>
                  <span className="chip chip--tipo">{inv.variante === 'con_misa' ? 'Con Misa' : 'Sin Misa'}</span>
                  {estado === 'si' && <span className="chip chip--si">Sí</span>}
                  {estado === 'no' && <span className="chip chip--no">No</span>}
                  {estado === 'pendiente' && <span className="chip chip--pend">Pendiente</span>}
                </div>
                {r?.restricciones && <div className="tabla__detalle">🍽 {r.restricciones}</div>}
                {r?.mensaje && <div className="tabla__detalle">💬 {r.mensaje}</div>}

                <div className="inv-card__menu-wrap">
                  <button
                    className="inv-card__menu-btn"
                    type="button"
                    aria-label="Más acciones"
                    aria-expanded={menuAbierto === inv.id}
                    onClick={() => setMenuAbierto(menuAbierto === inv.id ? null : inv.id)}
                  >
                    <span />
                    <span />
                    <span />
                  </button>
                  {menuAbierto === inv.id && (
                    <div className="inv-card__menu">
                      <button
                        className="btn-mini"
                        type="button"
                        onClick={() => {
                          setMenuAbierto(null)
                          setDialogo({ inv, accion: 'copiar' })
                        }}
                      >
                        {copiado === inv.id ? 'Copiado' : 'Copiar enlace'}
                      </button>
                      <label className="inv-card__menu-estado">
                        Cambiar estado
                        <select
                          value={estado}
                          onChange={(e) => {
                            onEstado(inv, e.target.value)
                            setMenuAbierto(null)
                          }}
                        >
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                          <option value="pendiente">Pendiente</option>
                        </select>
                      </label>
                      <button
                        className="btn-mini btn-mini--borrar"
                        type="button"
                        onClick={() => {
                          setMenuAbierto(null)
                          onBorrar(inv)
                        }}
                      >
                        Borrar
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {dialogo && (
        <ModalIdioma
          titulo={dialogo.accion === 'copiar' ? 'Copiar enlace' : 'Enviar por WhatsApp'}
          pregunta={
            <>
              ¿En qué idioma para <strong>{nombresDe(dialogo.inv)}</strong>?
            </>
          }
          idiomas={IDIOMAS_POR_VARIANTE[dialogo.inv.variante] ?? IDIOMAS_POR_VARIANTE.sin_misa}
          onElegir={elegirIdioma}
          onCancelar={() => setDialogo(null)}
        />
      )}

      {crearPendiente && (
        <ModalIdioma
          titulo="Nueva invitación"
          pregunta={
            <>
              ¿En qué idioma quieres que le aparezca a{' '}
              <strong>
                {crearPendiente.tipo === 'pareja'
                  ? `${crearPendiente.nombre} & ${crearPendiente.nombrePareja}`
                  : crearPendiente.nombre}
              </strong>
              ?
            </>
          }
          idiomas={IDIOMAS_POR_VARIANTE[crearPendiente.variante] ?? IDIOMAS_POR_VARIANTE.sin_misa}
          onElegir={elegirIdiomaCreacion}
          onCancelar={() => setCrearPendiente(null)}
        />
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
