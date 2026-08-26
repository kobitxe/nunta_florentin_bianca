-- Migración 004: asegura la restricción única en rsvps.invitado_id.
-- Ejecutar UNA VEZ en Supabase: Dashboard → SQL Editor → New query →
-- pegar y Run.
--
-- Por qué: tanto el formulario del invitado (guardarRsvp) como "cambiar
-- estado" en el panel admin (fijarAsistencia) guardan la respuesta con
-- un upsert (onConflict: 'invitado_id'). Ese upsert necesita que exista
-- una restricción unique sobre esa columna (la añadía migration-002),
-- pero si en ese momento ya había más de una fila de rsvps para el
-- mismo invitado, la restricción no se llegó a crear y todos los
-- upsert fallan en silencio (por eso "cambiar estado" no funciona y la
-- confirmación del invitado tampoco se refleja). Este script limpia
-- los duplicados si los hay y crea la restricción si falta; es seguro
-- volver a ejecutarlo aunque ya esté todo correcto.

-- Si un invitado tiene más de una fila en rsvps, se queda solo con la
-- respuesta más reciente.
delete from public.rsvps a
using public.rsvps b
where a.invitado_id = b.invitado_id
  and a.fecha_respuesta < b.fecha_respuesta;

do $$ begin
  alter table public.rsvps add constraint rsvps_invitado_id_unico unique (invitado_id);
exception when duplicate_table then null; when duplicate_object then null; end $$;
