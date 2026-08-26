export const urlDe = (token, lang) => `${window.location.origin}/i/${token}${lang ? `?lang=${lang}` : ''}`
export const nombresDe = (inv) => (inv.tipo === 'pareja' ? `${inv.nombre} & ${inv.nombre_pareja}` : inv.nombre)

export const IDIOMAS_LABEL = { ro: 'Rumano', es: 'Español', ru: 'Ruso' }
export const IDIOMAS_POR_VARIANTE = { sin_misa: ['ro', 'es'], con_misa: ['ro', 'ru', 'es'] }

export function mensajeCompartir(inv, lang) {
  const nombres = nombresDe(inv)
  const url = urlDe(inv.token, lang)
  if (lang === 'ro') {
    return inv.tipo === 'pareja'
      ? `Dragi ${nombres}, vă invităm cu drag la nunta noastră (Bianca & Florentin), 8 august 2027. Deschideți invitația voastră aici: ${url}`
      : `Dragă ${nombres}, te invităm cu drag la nunta noastră (Bianca & Florentin), 8 august 2027. Deschide invitația ta aici: ${url}`
  }
  if (lang === 'ru') {
    return inv.tipo === 'pareja'
      ? `Дорогие ${nombres}, приглашаем вас на нашу свадьбу (Bianca & Florentin), 8 августа 2027 года. Откройте своё приглашение здесь: ${url}`
      : `Дорогой(ая) ${nombres}, приглашаем тебя на нашу свадьбу (Bianca & Florentin), 8 августа 2027 года. Открой своё приглашение здесь: ${url}`
  }
  return inv.tipo === 'pareja'
    ? `Hola ${nombres}, nos encantaría que nos acompañarais en nuestra boda (Bianca & Florentin), 8 de agosto de 2027. Abrid vuestra invitación aquí: ${url}`
    : `Hola ${nombres}, nos encantaría que nos acompañaras en nuestra boda (Bianca & Florentin), 8 de agosto de 2027. Abre tu invitación aquí: ${url}`
}

export const linkWhatsApp = (inv, lang) => `https://wa.me/?text=${encodeURIComponent(mensajeCompartir(inv, lang))}`

// Desde que rsvps.invitado_id tiene restricción unique (migration-004),
// PostgREST embebe la relación como objeto ("uno a uno") en vez de lista;
// esto acepta las dos formas por si el caché de esquema de Supabase tarda
// en refrescarse tras el cambio.
export function primerRsvp(inv) {
  const r = inv.rsvps
  if (!r) return null
  return Array.isArray(r) ? (r[0] ?? null) : r
}

export function estadoDe(inv) {
  const r = primerRsvp(inv)
  if (!r) return 'pendiente'
  return r.asiste ? 'si' : 'no'
}
