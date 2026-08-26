-- Migración 003: segunda variante de invitación ("con misa") + idioma
-- guardado. Ejecutar UNA VEZ en Supabase: Dashboard → SQL Editor → New
-- query → pegar y Run. (Requiere haber ejecutado antes setup.sql y
-- migration-002-invitaciones.sql)

alter table public.invitados
  add column if not exists variante text not null default 'sin_misa'
  check (variante in ('sin_misa', 'con_misa'));

alter table public.invitados
  add column if not exists idioma text
  check (idioma is null or idioma in ('ro', 'es', 'ru'));
