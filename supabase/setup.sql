-- Invitación de boda Flo & Bianca   configuración de base de datos.
-- Ejecutar UNA VEZ en Supabase: Dashboard → SQL Editor → New query → pegar y Run.

-- ── Tablas ──────────────────────────────────────────────────────────────

create table if not exists public.invitados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text,
  telefono text,
  grupo text,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitado_id uuid not null references public.invitados (id) on delete cascade,
  asiste boolean not null,
  num_acompanantes integer not null default 0 check (num_acompanantes between 0 and 10),
  restricciones text,
  mensaje text,
  fecha_respuesta timestamptz not null default now()
);

create index if not exists rsvps_invitado_id_idx on public.rsvps (invitado_id);

-- ── Row Level Security ──────────────────────────────────────────────────
-- El formulario RSVP es público (anon key), así que anon puede insertar.
-- La lectura de rsvps es necesaria para las estadísticas públicas.

alter table public.invitados enable row level security;
alter table public.rsvps enable row level security;

drop policy if exists "anon inserta invitados" on public.invitados;
create policy "anon inserta invitados"
  on public.invitados for insert
  to anon
  with check (true);

drop policy if exists "anon lee invitados" on public.invitados;
create policy "anon lee invitados"
  on public.invitados for select
  to anon
  using (true);

drop policy if exists "anon inserta rsvps" on public.rsvps;
create policy "anon inserta rsvps"
  on public.rsvps for insert
  to anon
  with check (true);

drop policy if exists "anon lee rsvps" on public.rsvps;
create policy "anon lee rsvps"
  on public.rsvps for select
  to anon
  using (true);

-- Sin políticas de UPDATE/DELETE para anon: nadie puede borrar ni alterar
-- respuestas desde la web pública. Los novios gestionan los datos desde el
-- dashboard de Supabase (Table Editor), que usa el rol service_role.

-- ── Realtime (estadísticas en vivo) ─────────────────────────────────────

alter publication supabase_realtime add table public.rsvps;
