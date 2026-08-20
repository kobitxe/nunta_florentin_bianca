# Invitación de boda Flo & Bianca   React + Supabase (sin backend)

Fecha: 2026-08-20 · Estado: aprobado por el usuario (spec entregada cerrada)

## Arquitectura

- **Frontend:** React 19 + Vite (repo `front-boda`, GitHub `kobitxe/nunta_florentin_bianca`).
- **Hosting:** Vercel con auto-deploy desde GitHub.
- **Backend/BD:** Supabase (tier gratuito). React consume Supabase directamente vía `@supabase/supabase-js`. Sin Laravel, sin Railway, sin servidor propio.
- **Variables de entorno:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (`.env.local` en local, Environment Variables en Vercel).

## Datos reales

- Novios: **Flo & Bianca**.
- Ceremonia (cununia religioasă): **5 agosto 2027, ~11:00** (hora por confirmar)   Biserica Ortodoxă de Rit Vechi „Vovidenia", Strada Reșița 76, Brăila.
- Recepción: **8 agosto 2027, 17:00**   Restaurant Terasa Tic Tac Mamaia, Bulevardul Mamaia, Constanța.
- Mapas embebidos con `https://www.google.com/maps?q=<lugar>&output=embed` (sin API key) + enlace al link corto original.

## i18n

- Rumano (`ro`) por defecto, castellano (`es`) secundario.
- Implementación propia ligera: contexto React + diccionarios JS (`src/i18n/`). Selector en la navbar; preferencia persistida en `localStorage`.

## Base de datos (Supabase)

```
invitados: id uuid PK, nombre text NOT NULL, email text, telefono text, grupo text, created_at timestamptz default now()
rsvps:     id uuid PK, invitado_id uuid FK→invitados.id, asiste boolean NOT NULL,
           num_acompanantes int default 0, restricciones text, mensaje text,
           fecha_respuesta timestamptz default now()
```

- RLS activado en ambas tablas. Políticas: `anon` puede INSERT en ambas y SELECT en ambas (necesario para estadísticas públicas).
- Realtime habilitado en `rsvps` para estadísticas en vivo.
- Script completo en `supabase/setup.sql`   se ejecuta una vez en el SQL Editor de Supabase.

## Flujo RSVP

1. El invitado rellena: nombre, email/teléfono (opcional), asiste sí/no, nº acompañantes, restricciones dietéticas, mensaje.
2. La app inserta en `invitados`, recupera el `id` e inserta el `rsvp` vinculado.
3. Estadísticas (confirmados, no asisten, total personas incluyendo acompañantes) se consultan con `select` + suscripción Realtime.

## Componentes

`Navbar` (selector idioma) · `Hero` (nombres + fecha + cuenta atrás) · `Detalles` (ceremonia + recepción con mapas) · `Timeline` · `Galeria` (placeholder hasta recibir fotos de Bianca; preparada para Supabase Storage o URLs) · `RSVP` (formulario) · `Stats` (en vivo) · `Footer`.

One-pager con scroll, sin react-router.

## Diseño visual

Elegante, minimalista, mobile-first. Paleta cálida: dorado, beige, marrón suave. Tipografía serif elegante para títulos, sans para cuerpo. Animaciones sutiles (fade-in al hacer scroll).

## Entregables

- App React completa en local, `npm run build` verde.
- `supabase/setup.sql` listo para pegar en Supabase.
- `.env.example` + `.env.local` con placeholders.
- README con pasos de Supabase y Vercel.
- La creación del proyecto Supabase y la conexión Vercel↔GitHub las hace el usuario (requieren sus cuentas); todo lo demás queda automatizado.
