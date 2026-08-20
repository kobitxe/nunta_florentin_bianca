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
    .select('id, nombre, nombre_pareja, tipo')
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function obtenerRsvp(invitadoId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('rsvps')
    .select('asiste, restricciones, mensaje')
    .eq('invitado_id', invitadoId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function guardarRsvp({ invitadoId, esPareja, asiste, restricciones, mensaje }) {
  if (!supabase) throw new Error('supabase-not-configured')
  const { error } = await supabase.from('rsvps').upsert(
    {
      invitado_id: invitadoId,
      asiste,
      num_acompanantes: asiste && esPareja ? 1 : 0,
      restricciones: restricciones || null,
      mensaje: mensaje || null,
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

export async function crearInvitacion({ tipo, nombre, nombrePareja }) {
  if (!supabase) throw new Error('supabase-not-configured')
  const base = slug(tipo === 'pareja' ? `${nombre}-${nombrePareja}` : nombre)
  const token = `${base}-${Math.random().toString(36).slice(2, 6)}`
  const { data, error } = await supabase
    .from('invitados')
    .insert({ nombre, nombre_pareja: tipo === 'pareja' ? nombrePareja : null, tipo, token })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listarInvitaciones() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('invitados')
    .select('*, rsvps(asiste, restricciones, mensaje, fecha_respuesta)')
    .not('token', 'is', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
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
