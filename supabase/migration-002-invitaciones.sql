-- Migración 002: invitaciones personalizadas + panel de administración.
-- Ejecutar UNA VEZ en Supabase: Dashboard → SQL Editor → New query → pegar y Run.
-- (Requiere haber ejecutado antes setup.sql)

-- ── Invitados: token de URL, tipo individual/pareja y segundo nombre ────

alter table public.invitados add column if not exists token text unique;
alter table public.invitados
  add column if not exists tipo text not null default 'individual'
  check (tipo in ('individual', 'pareja'));
alter table public.invitados add column if not exists nombre_pareja text;

-- Una única respuesta por invitación (el invitado puede modificarla).
do $$ begin
  alter table public.rsvps add constraint rsvps_invitado_id_unico unique (invitado_id);
exception when duplicate_table then null; when duplicate_object then null; end $$;

-- ── RLS ─────────────────────────────────────────────────────────────────
-- Antes: cualquiera podía crear invitados (formulario abierto).
-- Ahora: solo el admin crea invitaciones; anon solo lee (para abrir su
-- enlace) y guarda/actualiza su respuesta.

drop policy if exists "anon inserta invitados" on public.invitados;

drop policy if exists "anon actualiza rsvps" on public.rsvps;
create policy "anon actualiza rsvps"
  on public.rsvps for update
  to anon
  using (true)
  with check (true);

-- Admin: acceso total desde el panel (/admin) con Supabase Auth.
-- Cambia el email si el admin es otro.
drop policy if exists "admin gestiona invitados" on public.invitados;
create policy "admin gestiona invitados"
  on public.invitados for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'daniel.milenteev@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'daniel.milenteev@gmail.com');

drop policy if exists "admin gestiona rsvps" on public.rsvps;
create policy "admin gestiona rsvps"
  on public.rsvps for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'daniel.milenteev@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'daniel.milenteev@gmail.com');

-- ── Pasos manuales tras ejecutar este SQL ───────────────────────────────
-- 1. Authentication → Users → Add user:
--      email daniel.milenteev@gmail.com + contraseña, con "Auto Confirm".
-- 2. Authentication → Sign In / Providers: desactivar "Allow new users
--    to sign up" (nadie más debe poder registrarse).
