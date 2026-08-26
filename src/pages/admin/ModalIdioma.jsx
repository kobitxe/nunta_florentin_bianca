import { IDIOMAS_LABEL } from './helpers.js'

// Popup genérico "¿en qué idioma?", reutilizado tanto para compartir un
// enlace ya creado como para elegir el idioma al crear una invitación
// "con misa" (antes de guardarla).
export default function ModalIdioma({ titulo, pregunta, idiomas, onElegir, onCancelar }) {
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
