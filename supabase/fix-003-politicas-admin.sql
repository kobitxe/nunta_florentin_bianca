-- Fix 003: la política de admin exigía un email exacto y no coincidía con
-- el del usuario creado en Auth. Como los registros públicos están
-- desactivados, cualquier usuario autenticado es uno creado por los novios
-- en el dashboard, así que basta con exigir "authenticated".
-- IMPORTANTE: mantener desactivado "Allow new users to sign up" en
-- Authentication → Sign In / Providers.
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run.

drop policy if exists "admin gestiona invitados" on public.invitados;
create policy "admin gestiona invitados"
  on public.invitados for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "admin gestiona rsvps" on public.rsvps;
create policy "admin gestiona rsvps"
  on public.rsvps for all
  to authenticated
  using (true)
  with check (true);
