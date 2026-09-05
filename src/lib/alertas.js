import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// Punto único para los diálogos tipo alert/confirm de la app. El estilo
// vive en index.css bajo las clases .swal-boda*; aquí solo se enlazan.
// Si en el futuro hace falta un aviso simple, añádelo aquí (p. ej. avisar()).
const SwalBoda = Swal.mixin({ buttonsStyling: false, reverseButtons: true })

const CLASES = (peligro) => ({
  popup: 'swal-boda',
  title: 'swal-boda__titulo',
  htmlContainer: 'swal-boda__texto',
  actions: 'swal-boda__acciones',
  confirmButton: `swal-boda__btn ${peligro ? 'swal-boda__btn--peligro' : 'swal-boda__btn--confirmar'}`,
  cancelButton: 'swal-boda__btn swal-boda__btn--cancelar',
})

// Reemplazo de window.confirm(). Devuelve true si el usuario confirma.
export async function confirmar({
  titulo,
  texto = '',
  confirmar = 'Sí',
  cancelar = 'Cancelar',
  peligro = false,
} = {}) {
  const { isConfirmed } = await SwalBoda.fire({
    title: titulo,
    text: texto,
    icon: peligro ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: cancelar,
    customClass: CLASES(peligro),
  })
  return isConfirmed
}
