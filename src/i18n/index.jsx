import { useState } from 'react'
import { I18nContext } from './context.js'
import ro from './ro.js'
import es from './es.js'

const diccionarios = { ro, es }
const STORAGE_KEY = 'boda-idioma'

export function I18nProvider({ children }) {
  const [idioma, setIdioma] = useState(() => {
    const guardado = localStorage.getItem(STORAGE_KEY)
    return guardado in diccionarios ? guardado : 'ro'
  })

  const cambiarIdioma = (nuevo) => {
    setIdioma(nuevo)
    localStorage.setItem(STORAGE_KEY, nuevo)
    document.documentElement.lang = nuevo
  }

  // t('rsvp.titlu') → valor del diccionario activo, con fallback a rumano.
  const t = (clave) => {
    const buscar = (dic) => clave.split('.').reduce((nodo, k) => nodo?.[k], dic)
    return buscar(diccionarios[idioma]) ?? buscar(ro) ?? clave
  }

  return <I18nContext.Provider value={{ idioma, cambiarIdioma, t }}>{children}</I18nContext.Provider>
}
