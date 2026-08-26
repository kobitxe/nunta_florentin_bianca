import { useEffect, useState } from 'react'
import { I18nContext } from './context.js'
import ro from './ro.js'
import es from './es.js'
import ru from './ru.js'

const diccionarios = { ro, es, ru }
const STORAGE_KEY = 'boda-idioma'

export function I18nProvider({ children, invitado }) {
  // Si el enlace trae ?lang= explícito, manda sobre cualquier idioma
  // guardado en la invitación (el admin lo usa para forzar un idioma
  // puntual al compartir, sin tocar el idioma guardado del invitado).
  const [langParam] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('lang')
    return param in diccionarios ? param : null
  })

  const [idioma, setIdioma] = useState(() => {
    if (langParam) return langParam
    const guardado = localStorage.getItem(STORAGE_KEY)
    return guardado in diccionarios ? guardado : 'ro'
  })

  // Cuando llegan los datos del invitado (fetch async en App.jsx) y trae un
  // idioma guardado, se adopta como idioma de la página — salvo que el enlace
  // ya forzara uno explícito con ?lang=. Ajuste de estado durante el render
  // (patrón documentado de React para "adjusting state when a prop changes"),
  // guardado por la comparación con idiomaGuestAplicado para que solo se
  // dispare una vez por cambio real.
  const [idiomaGuestAplicado, setIdiomaGuestAplicado] = useState(null)
  const idiomaGuest = invitado?.idioma
  if (idiomaGuest && idiomaGuest !== idiomaGuestAplicado && !langParam && idiomaGuest in diccionarios) {
    setIdiomaGuestAplicado(idiomaGuest)
    setIdioma(idiomaGuest)
  }

  // Sincroniza el idioma activo con el DOM y localStorage — efecto puro (sin
  // setState dentro), disparado por cualquier cambio de idioma, manual o del
  // invitado.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, idioma)
    document.documentElement.lang = idioma
  }, [idioma])

  const cambiarIdioma = (nuevo) => setIdioma(nuevo)

  // t('rsvp.titlu') → valor del diccionario activo, con fallback a rumano.
  const t = (clave) => {
    const buscar = (dic) => clave.split('.').reduce((nodo, k) => nodo?.[k], dic)
    return buscar(diccionarios[idioma]) ?? buscar(ro) ?? clave
  }

  return <I18nContext.Provider value={{ idioma, cambiarIdioma, t }}>{children}</I18nContext.Provider>
}
