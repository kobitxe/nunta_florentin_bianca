import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mientras Supabase no esté configurado (env vacías), el cliente es null y
// la UI muestra un estado "configuración pendiente" en vez de romperse.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export async function enviarRsvp({ nombre, email, telefono, asiste, numAcompanantes, restricciones, mensaje }) {
  if (!supabase) throw new Error('supabase-not-configured')

  const { data: invitado, error: errInvitado } = await supabase
    .from('invitados')
    .insert({ nombre, email: email || null, telefono: telefono || null })
    .select('id')
    .single()
  if (errInvitado) throw errInvitado

  const { error: errRsvp } = await supabase.from('rsvps').insert({
    invitado_id: invitado.id,
    asiste,
    num_acompanantes: numAcompanantes,
    restricciones: restricciones || null,
    mensaje: mensaje || null,
  })
  if (errRsvp) throw errRsvp
}

export async function cargarStats() {
  if (!supabase) return null
  const { data, error } = await supabase.from('rsvps').select('asiste, num_acompanantes')
  if (error) throw error

  const confirmados = data.filter((r) => r.asiste)
  return {
    respuestas: data.length,
    confirmados: confirmados.length,
    noAsisten: data.length - confirmados.length,
    totalPersonas: confirmados.reduce((sum, r) => sum + 1 + (r.num_acompanantes || 0), 0),
  }
}

export function suscribirRsvps(onChange) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('rsvps-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
