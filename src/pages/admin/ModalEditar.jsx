import { useState } from 'react'
import { IDIOMAS_LABEL, IDIOMAS_POR_VARIANTE, primerRsvp } from './helpers.js'

const MAX_NINOS = 20

// Modal para corregir una invitación ya creada: nombre(s), si lleva misa,
// idioma y, si el invitado ya confirmó que asiste, el número de niños.
// El tipo (individual/pareja) no se toca aquí, se fija al crear.
export default function ModalEditar({ inv, onGuardar, onCancelar }) {
  const rsvp = primerRsvp(inv)
  const puedeEditarNinos = rsvp?.asiste === true

  const [nombre, setNombre] = useState(inv.nombre ?? '')
  const [nombrePareja, setNombrePareja] = useState(inv.nombre_pareja ?? '')
  const [variante, setVariante] = useState(inv.variante ?? 'sin_misa')
  const [idioma, setIdioma] = useState(inv.idioma ?? '')
  const [numNinos, setNumNinos] = useState(rsvp?.num_ninos ?? 0)
  const [guardando, setGuardando] = useState(false)

  const idiomasDisponibles = IDIOMAS_POR_VARIANTE[variante] ?? IDIOMAS_POR_VARIANTE.sin_misa

  const cambiarNumNinos = (raw) => {
    setNumNinos(Math.max(0, Math.min(MAX_NINOS, Math.floor(Number(raw) || 0))))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || (inv.tipo === 'pareja' && !nombrePareja.trim())) return
    setGuardando(true)
    try {
      await onGuardar({
        nombre: nombre.trim(),
        nombrePareja: nombrePareja.trim(),
        variante,
        idioma: idioma || null,
        numNinos: puedeEditarNinos ? numNinos : undefined,
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal" onClick={onCancelar}>
      <div className="modal__card modal__card--form" onClick={(e) => e.stopPropagation()}>
        <h3>Editar invitación</h3>
        <form onSubmit={onSubmit}>
          <div className="campo">
            <label htmlFor="editar-nombre">Nombre</label>
            <input
              id="editar-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          {inv.tipo === 'pareja' && (
            <div className="campo">
              <label htmlFor="editar-pareja">Su pareja</label>
              <input
                id="editar-pareja"
                type="text"
                required
                value={nombrePareja}
                onChange={(e) => setNombrePareja(e.target.value)}
              />
            </div>
          )}
          <div className="campo">
            <label htmlFor="editar-variante">Invitación</label>
            <select
              id="editar-variante"
              value={variante}
              onChange={(e) => {
                const nueva = e.target.value
                setVariante(nueva)
                const disponibles = IDIOMAS_POR_VARIANTE[nueva] ?? IDIOMAS_POR_VARIANTE.sin_misa
                if (idioma && !disponibles.includes(idioma)) setIdioma('')
              }}
            >
              <option value="sin_misa">Sin Misa</option>
              <option value="con_misa">Con Misa</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="editar-idioma">Idioma</label>
            <select id="editar-idioma" value={idioma} onChange={(e) => setIdioma(e.target.value)}>
              <option value="">Sin elegir</option>
              {idiomasDisponibles.map((cod) => (
                <option key={cod} value={cod}>
                  {IDIOMAS_LABEL[cod]}
                </option>
              ))}
            </select>
          </div>
          {puedeEditarNinos && (
            <div className="campo">
              <label htmlFor="editar-ninos">Número de niños</label>
              <input
                id="editar-ninos"
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_NINOS}
                value={numNinos}
                onChange={(e) => cambiarNumNinos(e.target.value)}
              />
            </div>
          )}
          <div className="modal__acciones">
            <button className="btn-mini" type="button" onClick={onCancelar}>
              Cancelar
            </button>
            <button className="rsvp__enviar" type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
