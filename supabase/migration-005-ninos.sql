-- Migración 005: número de niños y sus edades en cada respuesta.
-- Ejecutar UNA VEZ en Supabase: Dashboard → SQL Editor → New query →
-- pegar y Run. (Requiere setup.sql + migration-002 antes.)
--
-- Por qué: para planificar los menús los novios necesitan saber cuántos
-- niños vienen con cada invitación y sus edades (menú infantil vs. bebé,
-- tronas). Se guarda solo cuando el invitado confirma que asiste; si dice
-- que no o pone 0, num_ninos queda en 0 y edades_ninos en null.
--
-- Se usa una columna nueva y propia en vez de reutilizar num_acompanantes
-- para no alterar el recuento de adultos ("Personas confirmadas").

alter table public.rsvps
  add column if not exists num_ninos integer not null default 0
  check (num_ninos between 0 and 6);

-- Edades de cada niño, una por niño, separadas por comas en el mismo orden
-- en que se muestran ("Niño 1, Niño 2, …"). Ej.: 'Menos de 1 año, 7, 3'.
alter table public.rsvps add column if not exists edades_ninos text;
