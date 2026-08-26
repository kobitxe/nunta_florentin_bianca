import { useEffect, useState } from 'react'
import { crearInvitacion, borrarInvitacion, fijarAsistencia } from '../../lib/supabase.js'
import ModalIdioma from './ModalIdioma.jsx'
import { urlDe, nombresDe, estadoDe, IDIOMAS_POR_VARIANTE } from './helpers.js'

export default function Invitaciones({ lista, refrescar }) {
  const [error, setError] = useState(null)
  const [tipo, setTipo] = useState('individual')
  const [variante, setVariante] = useState('sin_misa')
  const [nombre, setNombre] = useState('')
  const [nombrePareja, setNombrePareja] = useState('')
  const [creando, setCreando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [dialogo, setDialogo] = useState(null) // invitación a la que copiar el enlace
  const [crearPendiente, setCrearPendiente] = useState(null) // datos del formulario a falta del idioma
  const [menuAbierto, setMenuAbierto] = useState(null) // id de la invitación con el menú de acciones abierto

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
      setError(null)
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
      setError(null)
    } catch (err) {
      setError(`No se pudo borrar la invitación.${err?.message ? ` (${err.message})` : ''}`)
    }
  }

  const onEstado = async (inv, estado) => {
    try {
      await fijarAsistencia(inv, estado)
      refrescar()
      setError(null)
    } catch (err) {
      setError(`No se pudo cambiar el estado.${err?.message ? ` (${err.message})` : ''}`)
    }
  }

  // Copiar pregunta primero el idioma; el enlace lleva ?lang= para que la
  // invitación se abra directamente en ese idioma. No cambia el idioma
  // guardado del invitado, solo el del enlace puntual.
  const elegirIdioma = async (lang) => {
    const inv = dialogo
    setDialogo(null)
    await navigator.clipboard.writeText(urlDe(inv.token, lang))
    setCopiado(inv.id)
    setTimeout(() => setCopiado(null), 1500)
  }

  return (
    <div className="admin-seccion">
      <h2 className="admin-seccion__titulo">Invitaciones</h2>

      <form className="crear" onSubmit={onCrear}>
        <h3>Nueva invitación</h3>
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

      <h3 className="admin-seccion__subtitulo">Invitaciones creadas</h3>
      {lista.length === 0 ? (
        <p className="aviso aviso--info">Todavía no hay invitaciones. Crea la primera arriba.</p>
      ) : (
        <ul className="lista-inv">
          {lista.map((inv) => {
            const estado = estadoDe(inv)
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
                          setDialogo(inv)
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
          titulo="Copiar enlace"
          pregunta={
            <>
              ¿En qué idioma para <strong>{nombresDe(dialogo)}</strong>?
            </>
          }
          idiomas={IDIOMAS_POR_VARIANTE[dialogo.variante] ?? IDIOMAS_POR_VARIANTE.sin_misa}
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
