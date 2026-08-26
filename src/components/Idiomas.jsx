import { useI18n } from '../i18n/context.js'
import { BANDERAS } from '../lib/banderas.jsx'

const ORDEN_POR_VARIANTE = {
  sin_misa: ['ro', 'es'],
  con_misa: ['ro', 'ru', 'es'],
}

// Selector de idioma flotante: la bandera activa a todo color, las demás
// apagadas hasta que se pasa por encima o se selecciona. Las invitaciones
// "con misa" muestran también la bandera rusa.
export default function Idiomas({ variante = 'sin_misa' }) {
  const { idioma, cambiarIdioma } = useI18n()
  const codigos = ORDEN_POR_VARIANTE[variante] ?? ORDEN_POR_VARIANTE.sin_misa

  return (
    <div className="idiomas" role="group" aria-label="Limba / Idioma / Язык">
      {codigos.map((cod) => {
        const { nombre, svg } = BANDERAS[cod]
        return (
          <button
            key={cod}
            type="button"
            className={`idiomas__btn${idioma === cod ? ' activo' : ''}`}
            aria-pressed={idioma === cod}
            aria-label={nombre}
            title={nombre}
            onClick={() => cambiarIdioma(cod)}
          >
            {svg}
          </button>
        )
      })}
    </div>
  )
}
