export const nombresDe = (inv) =>
  inv.tipo === 'pareja' ? `${inv.nombre} & ${inv.nombre_pareja}` : inv.nombre

const capitalizar = (slugParte) =>
  slugParte
    .split('-')
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ')

// Adelanto provisional del nombre mientras responde Supabase: el token
// ya lleva el slug del nombre (ver crearInvitacion en supabase.js), con
// un sufijo aleatorio de 4 caracteres al final ("-a1b2"). En una pareja,
// los dos nombres van unidos por "_" (crearInvitacion los separa así a
// propósito), lo que permite reconstruir el "&"; los tokens antiguos sin
// "_" se muestran seguidos, sin ampersand. Sin tildes: es solo un
// relleno aproximado hasta que llegue el nombre real.
export function nombreDesdeToken(token) {
  if (!token) return ''
  const base = token.replace(/-[a-z0-9]{4}$/, '')
  if (!base) return ''
  if (base.includes('_')) {
    return base.split('_').map(capitalizar).filter(Boolean).join(' & ')
  }
  return capitalizar(base)
}
