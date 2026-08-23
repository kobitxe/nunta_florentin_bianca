import { useI18n } from '../i18n/context.js'

// Banderas como SVG inline: escalan con el contenedor y se recortan
// en círculo con overflow hidden.
const BANDERAS = {
  ro: {
    nombre: 'Română',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1" height="2" fill="#002B7F" />
        <rect x="1" width="1" height="2" fill="#FCD116" />
        <rect x="2" width="1" height="2" fill="#CE1126" />
      </svg>
    ),
  },
  es: {
    nombre: 'Español',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="3" height="2" fill="#AA151B" />
        <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      </svg>
    ),
  },
}

// Selector de idioma flotante: la bandera activa a todo color,
// la otra apagada hasta que se pasa por encima o se selecciona.
export default function Idiomas() {
  const { idioma, cambiarIdioma } = useI18n()

  return (
    <div className="idiomas" role="group" aria-label="Limba / Idioma">
      {Object.entries(BANDERAS).map(([cod, { nombre, svg }]) => (
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
      ))}
    </div>
  )
}
