-- Migración 007: notas privadas del admin sobre cada invitación.
-- Ejecutar UNA VEZ en Supabase: Dashboard → SQL Editor → New query →
-- pegar y Run. (Requiere setup.sql + migration-002 antes.)
--
-- Por qué una tabla aparte y no una columna en invitados: la tabla
-- invitados la puede leer cualquiera con la clave anon (lo necesita el
-- invitado para abrir su enlace), así que una columna allí sería visible
-- desde fuera. Aquí solo el admin autenticado puede leer y escribir.

create table if not exists public.notas_invitados (
  invitado_id uuid primary key references public.invitados(id) on delete cascade,
  nota text not null,
  updated_at timestamptz not null default now()
);

alter table public.notas_invitados enable row level security;

-- Sin políticas para anon: el público no puede ni leer ni escribir.
drop policy if exists "admin gestiona notas" on public.notas_invitados;
create policy "admin gestiona notas"
  on public.notas_invitados for all
  to authenticated
  using (true)
  with check (true);
