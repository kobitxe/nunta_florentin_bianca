import { useEffect, useRef, useState } from 'react'
import { crearInvitacion, actualizarInvitacion, borrarInvitacion, fijarAsistencia } from '../../lib/supabase.js'
import { confirmar } from '../../lib/alertas.js'
import ModalIdioma from './ModalIdioma.jsx'
import ModalEditar from './ModalEditar.jsx'
import { BANDERAS } from '../../lib/banderas.jsx'
import { urlDe, nombresDe, estadoDe, IDIOMAS_POR_VARIANTE } from './helpers.js'

export default function Invitaciones({ lista, refrescar }) {
  const [error, setError] = useState(null)
  const [tipo, setTipo] = useState('individual')
  const [variante, setVariante] = useState('sin_misa')
  const [nombre, setNombre] = useState('')
  const [nombrePareja, setNombrePareja] = useState('')
  const [creando, setCreando] = useState(false)
  const [aviso, setAviso] = useState(null) // toast de confirmación (p. ej. al copiar el enlace)
  const [editando, setEditando] = useState(null) // invitación abierta en el modal de edición
  const [crearPendiente, setCrearPendiente] = useState(null) // datos del formulario a falta del idioma
  const [menuAbierto, setMenuAbierto] = useState(null) // id de la invitación con el menú de acciones abierto
  const avisoTimeout = useRef(null)

  // Cierra el menú de "más acciones" al pulsar fuera de él.
  useEffect(() => {
    if (!menuAbierto) return
    const onClickFuera = (e) => {
      if (!e.target.closest('.inv-card__menu-wrap')) setMenuAbierto(null)
    }
    document.addEventListener('click', onClickFuera)
    return () => document.removeEventListener('click', onClickFuera)
  }, [menuAbierto])

  useEffect(() => () => clearTimeout(avisoTimeout.current), [])

  const mostrarAviso = (mensaje, tipo = 'ok') => {
    clearTimeout(avisoTimeout.current)
    setAviso({ mensaje, tipo })
    avisoTimeout.current = setTimeout(() => setAviso(null), 2500)
  }

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
    const ok = await confirmar({
      titulo: `¿Borrar la invitación de ${nombresDe(inv)}?`,
      texto: 'También se borrará su respuesta.',
      confirmar: 'Borrar',
      cancelar: 'Cancelar',
      peligro: true,
    })
    if (!ok) return
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

  // El enlace se copia directamente en el idioma ya guardado de la
  // invitación (elegido al crearla o corregido luego desde "Editar").
  const copiarEnlace = async (inv) => {
    try {
      await navigator.clipboard.writeText(urlDe(inv.token, inv.idioma))
      mostrarAviso(`Enlace de ${nombresDe(inv)} copiado.`)
    } catch {
      mostrarAviso('No se pudo copiar el enlace.', 'error')
    }
  }

  const onGuardarEdicion = async (datos) => {
    const inv = editando
    await actualizarInvitacion(inv.id, { ...datos, tipo: inv.tipo })
    setEditando(null)
    refrescar()
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
              <option value="individual">Individual</option>
              <option value="pareja">Pareja</option>
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
                  {inv.idioma && BANDERAS[inv.idioma] && (
                    <span className="inv-card__bandera" title={BANDERAS[inv.idioma].nombre}>
                      {BANDERAS[inv.idioma].svg}
                    </span>
                  )}
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
                          copiarEnlace(inv)
                        }}
                      >
                        Copiar enlace
                      </button>
                      <button
                        className="btn-mini"
                        type="button"
                        onClick={() => {
                          setMenuAbierto(null)
                          setEditando(inv)
                        }}
                      >
                        Editar
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

      {editando && (
        <ModalEditar inv={editando} onGuardar={onGuardarEdicion} onCancelar={() => setEditando(null)} />
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

      {aviso && (
        <div className={`toast aviso aviso--${aviso.tipo === 'error' ? 'error' : 'ok'}`} role="status">
          {aviso.mensaje}
        </div>
      )}
    </div>
  )
}
