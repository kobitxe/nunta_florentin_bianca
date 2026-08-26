import { useEffect, useRef, useState } from 'react'
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
  const langParamRef = useRef(null)

  const [idioma, setIdioma] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('lang')
    if (param in diccionarios) {
      langParamRef.current = param
      return param
    }
    const guardado = localStorage.getItem(STORAGE_KEY)
    return guardado in diccionarios ? guardado : 'ro'
  })

  const cambiarIdioma = (nuevo) => {
    setIdioma(nuevo)
    localStorage.setItem(STORAGE_KEY, nuevo)
    document.documentElement.lang = nuevo
  }

  // Cuando llegan los datos del invitado (fetch async en App.jsx) y trae
  // un idioma guardado, se adopta como idioma de la página — salvo que el
  // enlace ya forzara uno explícito con ?lang=.
  useEffect(() => {
    const lang = invitado?.idioma
    if (!lang || langParamRef.current || !(lang in diccionarios)) return
    if (lang === idioma) return
    setIdioma(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [invitado, idioma])

  // t('rsvp.titlu') → valor del diccionario activo, con fallback a rumano.
  const t = (clave) => {
    const buscar = (dic) => clave.split('.').reduce((nodo, k) => nodo?.[k], dic)
    return buscar(diccionarios[idioma]) ?? buscar(ro) ?? clave
  }

  return <I18nContext.Provider value={{ idioma, cambiarIdioma, t }}>{children}</I18nContext.Provider>
}
