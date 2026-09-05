import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mientras Supabase no esté configurado (env vacías), el cliente es null y
// la UI muestra un estado "configuración pendiente" en vez de romperse.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

// ── Invitación pública (por token de la URL) ─────────────────────────────

export async function buscarInvitadoPorToken(token) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('invitados')
    .select('id, nombre, nombre_pareja, tipo, variante, idioma')
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function obtenerRsvp(invitadoId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('rsvps')
    .select('asiste, restricciones, mensaje, num_ninos, edades_ninos')
    .eq('invitado_id', invitadoId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function guardarRsvp({
  invitadoId,
  esPareja,
  asiste,
  restricciones,
  mensaje,
  numNinos,
  edadesNinos,
}) {
  if (!supabase) throw new Error('supabase-not-configured')
  // Los niños y sus edades solo tienen sentido si el invitado asiste.
  const ninos = asiste ? Math.max(0, Math.min(6, Number(numNinos) || 0)) : 0
  const { error } = await supabase.from('rsvps').upsert(
    {
      invitado_id: invitadoId,
      asiste,
      num_acompanantes: asiste && esPareja ? 1 : 0,
      restricciones: restricciones || null,
      mensaje: mensaje || null,
      num_ninos: ninos,
      edades_ninos: ninos > 0 && edadesNinos ? edadesNinos : null,
      fecha_respuesta: new Date().toISOString(),
    },
    { onConflict: 'invitado_id' },
  )
  if (error) throw error
}

// ── Panel de administración ──────────────────────────────────────────────

function slug(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function crearInvitacion({ tipo, nombre, nombrePareja, variante, idioma }) {
  if (!supabase) throw new Error('supabase-not-configured')
  // Los dos nombres de una pareja se unen con "_" (slug() nunca produce
  // ese carácter) para poder distinguirlos luego en nombreDesdeToken()
  // y reconstruir el "&" antes de que responda el backend.
  const base = tipo === 'pareja' ? `${slug(nombre)}_${slug(nombrePareja)}` : slug(nombre)
  const token = `${base}-${Math.random().toString(36).slice(2, 6)}`
  const { data, error } = await supabase
    .from('invitados')
    .insert({
      nombre,
      nombre_pareja: tipo === 'pareja' ? nombrePareja : null,
      tipo,
      token,
      variante,
      idioma: idioma ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listarInvitaciones() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('invitados')
    .select('*, rsvps(asiste, restricciones, mensaje, num_ninos, edades_ninos, fecha_respuesta)')
    .not('token', 'is', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Corrección manual desde el panel: 'si' | 'no' | 'pendiente'.
// 'pendiente' borra la respuesta; sí/no la crea o actualiza sin tocar
// restricciones ni mensaje ya guardados.
export async function fijarAsistencia(inv, estado) {
  if (!supabase) throw new Error('supabase-not-configured')
  if (estado === 'pendiente') {
    const { error } = await supabase.from('rsvps').delete().eq('invitado_id', inv.id)
    if (error) throw error
    return
  }
  const asiste = estado === 'si'
  const { error } = await supabase.from('rsvps').upsert(
    {
      invitado_id: inv.id,
      asiste,
      num_acompanantes: asiste && inv.tipo === 'pareja' ? 1 : 0,
      fecha_respuesta: new Date().toISOString(),
    },
    { onConflict: 'invitado_id' },
  )
  if (error) throw error
}

export async function actualizarInvitacion(id, { nombre, nombrePareja, tipo, variante, idioma }) {
  if (!supabase) throw new Error('supabase-not-configured')
  const { error } = await supabase
    .from('invitados')
    .update({
      nombre,
      nombre_pareja: tipo === 'pareja' ? nombrePareja : null,
      variante,
      idioma: idioma ?? null,
    })
    .eq('id', id)
  if (error) throw error
}

export async function borrarInvitacion(id) {
  if (!supabase) throw new Error('supabase-not-configured')
  const { error } = await supabase.from('invitados').delete().eq('id', id)
  if (error) throw error
}

export function suscribirRsvps(onChange) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('rsvps-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
