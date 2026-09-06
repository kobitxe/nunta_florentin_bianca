import { LuUtensilsCrossed, LuBaby, LuMessageCircle } from 'react-icons/lu'
import { nombresDe, estadoDe, primerRsvp } from './helpers.js'

function formatoFecha(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Respuestas({ lista }) {
  // Los que ya han respondido primero (más recientes arriba); los
  // pendientes se quedan al final, para que lo nuevo destaque.
  const ordenada = [...lista].sort((a, b) => {
    const ra = primerRsvp(a)
    const rb = primerRsvp(b)
    if (!ra && !rb) return 0
    if (!ra) return 1
    if (!rb) return -1
    return new Date(rb.fecha_respuesta) - new Date(ra.fecha_respuesta)
  })

  return (
    <div className="admin-seccion">
      <h2 className="admin-seccion__titulo">Respuestas</h2>

      {ordenada.length === 0 ? (
        <p className="aviso aviso--info">Todavía no hay invitaciones creadas.</p>
      ) : (
        <ul className="lista-respuestas">
          {ordenada.map((inv) => {
            const estado = estadoDe(inv)
            const r = primerRsvp(inv)
            return (
              <li className="respuesta-card" key={inv.id}>
                <div className="respuesta-card__top">
                  <strong className="inv-card__nombre">{nombresDe(inv)}</strong>
                  
                  {r?.fecha_respuesta && (
                    <span className="respuesta-card__fecha">{formatoFecha(r.fecha_respuesta)}</span>
                  )}

                  {estado === 'si' && <span className="chip chip--si">Sí</span>}
                  {estado === 'no' && <span className="chip chip--no">No</span>}
                  {estado === 'pendiente' && <span className="chip chip--pend">Pendiente</span>}
                 
                </div>
                {!r && <p className="tabla__detalle">Todavía no ha respondido.</p>}
                {r?.restricciones && (
                  <div className="tabla__detalle tabla__detalle--con-icono">
                    <LuUtensilsCrossed size={14} aria-hidden="true" />
                    <span>{r.restricciones}</span>
                  </div>
                )}
                {r?.num_ninos > 0 && (
                  <div className="tabla__detalle tabla__detalle--con-icono">
                    <LuBaby size={14} aria-hidden="true" />
                    <span>
                      {r.num_ninos} {r.num_ninos === 1 ? 'niño' : 'niños'}
                    </span>
                  </div>
                )}
                {r?.mensaje && (
                  <div className="tabla__detalle tabla__detalle--con-icono">
                    <LuMessageCircle size={14} aria-hidden="true" />
                    <span>{r.mensaje}</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
