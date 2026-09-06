-- Migración 006: dejar de pedir las edades de los niños y quitar el máximo.
-- Ejecutar UNA VEZ en Supabase: Dashboard → SQL Editor → New query →
-- pegar y Run. (Requiere migration-005 antes.)
--
-- Por qué: los novios ya saben las edades de los niños; en el formulario
-- solo necesitan saber si vienen con ellos y cuántos, sin mínimo ni máximo.
-- Se amplía el check de num_ninos (antes 0–6) a 0–20 como simple
-- salvaguarda, ya que el formulario no muestra ningún tope.
--
-- La columna edades_ninos se conserva para no perder lo ya recogido; la app
-- deja de leerla y de escribirla (se pone a null al reenviar una respuesta).

alter table public.rsvps
  drop constraint if exists rsvps_num_ninos_check;

alter table public.rsvps
  add constraint rsvps_num_ninos_check check (num_ninos between 0 and 20);
