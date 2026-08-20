# Flo & Bianca — Invitación de boda

Invitación web bilingüe (rumano/castellano) para la boda de Flo & Bianca.

- **Ceremonia:** 5 agosto 2027 · Biserica „Vovidenia", Brăila
- **Recepción:** 8 agosto 2027, 17:00 · Restaurant Terasa Tic Tac, Mamaia

## Arquitectura

React (Vite) → Vercel · Datos en Supabase (sin backend propio).
El frontend habla directamente con Supabase vía `@supabase/supabase-js` usando la anon key pública; RLS limita a `anon` a insertar y leer RSVPs (nada de updates/deletes).

## Desarrollo local

```bash
npm install
npm run dev
```

Sin configurar Supabase la web funciona igualmente: el formulario RSVP y las estadísticas muestran un estado "activo en breve".

## Configurar Supabase (una vez)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com) (región `eu-central` recomendada).
2. **SQL Editor → New query**: pega el contenido de [`supabase/setup.sql`](supabase/setup.sql) y ejecuta. Crea las tablas `invitados` y `rsvps`, las políticas RLS y habilita Realtime.
3. **Project Settings → API**: copia la *Project URL* y la *anon public key*.
4. Pégalas en `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Reinicia `npm run dev` y prueba el formulario RSVP.

## Desplegar en Vercel (una vez)

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo `kobitxe/nunta_florentin_bianca`. Vercel detecta Vite automáticamente (build `npm run build`, output `dist`).
2. En **Environment Variables** añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores de `.env.local`.
3. Deploy. Cada `git push` a `main` redespliega automáticamente.

## Contenido editable

- **Fechas, lugares, hora de la ceremonia:** `src/config/wedding.js` (cuando se confirme la hora, cambia `fechaISO` y pon `horaConfirmada: true`).
- **Textos rumano/castellano:** `src/i18n/ro.js` y `src/i18n/es.js` (incluido el programa del día).
- **Fotos de la galería:** añade URLs al array `GALERIA_FOTOS` de `src/config/wedding.js`. Pueden ser URLs públicas de Supabase Storage (bucket público `galeria`) o externas.

## Ver las respuestas

Supabase Dashboard → **Table Editor** → tablas `invitados` y `rsvps`. Las estadísticas públicas de la web se actualizan en vivo vía Realtime.
