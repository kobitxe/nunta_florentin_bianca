export const urlDe = (token, lang) => `${window.location.origin}/i/${token}${lang ? `?lang=${lang}` : ''}`
export const nombresDe = (inv) => (inv.tipo === 'pareja' ? `${inv.nombre} & ${inv.nombre_pareja}` : inv.nombre)

export const IDIOMAS_LABEL = { ro: 'Rumano', es: 'Español', ru: 'Ruso' }
export const IDIOMAS_POR_VARIANTE = { sin_misa: ['ro', 'es'], con_misa: ['ro', 'ru', 'es'] }

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
