# Segunda variante de invitación: "Con Misa" (RO/RU/ES)

Fecha: 2026-08-26 · Estado: aprobado por el usuario

## Contexto

La invitación actual (`sin_misa`) cubre solo el 8 de agosto de 2027 (recepción,
Mamaia) en rumano/español. Parte de los invitados (familia rusoparlante) debe
acudir además a la cununia religioasă del 5 de agosto de 2027 en Brăila. Se
necesita una segunda variante de invitación, idéntica en diseño a la actual,
que añada la tarjeta del 5 de agosto y soporte tres idiomas: rumano, ruso y
español.

Dato de la misa (confirmado por el usuario):

- Fecha: 5 de agosto de 2027 (jueves).
- Hora: ~11:00, pendiente de confirmación final (Vladaca la confirma al día
  siguiente).
- Lugar: Biserica Ortodoxă de Rit Vechi «Vovidenia», Strada Reșița 76, Brăila
  (mismo dato que en el spec original del proyecto).
- Maps: `https://maps.app.goo.gl/TZY2cbGt27xjeFCRA?g_st=iw`
- Foto: `misa.jpeg` (ya existe en `public/`).

## Alcance

1. Base de datos: nuevas columnas `variante` e `idioma` en `invitados`.
2. Panel admin: elegir variante al crear (Sin Misa / Con Misa); si es Con
   Misa, popup para elegir idioma (Rumano/Ruso/Español) antes de guardar;
   listado con banderita del idioma guardado.
3. Sitio público: tarjeta nueva del 5 de agosto (solo variante `con_misa`),
   idioma ruso completo, selector de idioma con 2 o 3 banderas según
   variante.
4. Traducción `ru.js`, best-effort de Claude — recomendar revisión por
   hablante nativo antes de enviar invitaciones reales.

Fuera de alcance: RSVP no cambia (misma tabla `rsvps`, sin distinción de
variante). No se toca el flujo de `sin_misa` salvo pasarle `variante` con
valor por defecto.

## Base de datos

Nueva migración `supabase/migration-003-invitacion-con-misa.sql`:

```sql
alter table public.invitados
  add column if not exists variante text not null default 'sin_misa'
  check (variante in ('sin_misa', 'con_misa'));

alter table public.invitados
  add column if not exists idioma text
  check (idioma is null or idioma in ('ro', 'es', 'ru'));
```

Sin cambios de RLS (las políticas ya cubren `for all` sobre `invitados` para
el admin autenticado, y `select` para `anon`).

## `src/lib/supabase.js`

- `buscarInvitadoPorToken`: añadir `variante, idioma` al `select`.
- `crearInvitacion({ tipo, nombre, nombrePareja, variante, idioma })`: incluir
  `variante` e `idioma` (`idioma` solo si `variante === 'con_misa'`, si no
  `null`) en el `insert`.
- `listarInvitaciones`: sin cambios de query (`select('*')` ya trae las
  columnas nuevas).

## Panel admin (`src/pages/Admin.jsx`)

**Formulario "Nueva invitación":**

- Nuevo `<select id="crear-variante">`: `Sin Misa` (`sin_misa`, valor por
  defecto) / `Con Misa` (`con_misa`).
- `onCrear`:
  - Si `variante === 'sin_misa'`: crea igual que hoy (`idioma: null`).
  - Si `variante === 'con_misa'`: en vez de crear directamente, abre un
    popup nuevo (mismo componente de modal que el de compartir, pero con
    3 opciones Rumano/Ruso/Español) y guarda los datos del formulario en un
    estado pendiente (`pendienteCrear`). Al elegir idioma, se llama a
    `crearInvitacion` con esos datos + el idioma elegido, se limpia el
    formulario y se refresca la lista.
  - Cancelar el popup no crea nada.

**Popup de compartir (ya existente, `dialogo`):**

- Las opciones de idioma dependen de `dialogo.inv.variante`:
  `sin_misa` → Rumano/Español (como hoy); `con_misa` → Rumano/Ruso/Español.
- No modifica el `idioma` guardado del invitado; solo afecta el `?lang=` del
  enlace generado (comportamiento actual sin cambios).

**Listado (`lista-inv`):**

- Cada `inv-card` de variante `con_misa` muestra una banderita pequeña junto
  al chip de tipo, según `inv.idioma` (🇷🇴 / 🇷🇺 / 🇪🇸 — mismo estilo visual que
  las banderas de `Idiomas.jsx`, reutilizando los SVG). Las `sin_misa` no
  llevan bandera (no tienen idioma guardado).

## Sitio público

**`src/App.jsx`:**

- Pasa `invitado` a `<Detalles invitado={invitado} />`.
- Pasa `variante={invitado?.variante ?? 'sin_misa'}` a `<Idiomas />`.
- `<I18nProvider>` recibe `invitado` como prop (ver siguiente punto).

**`src/i18n/index.jsx` (`I18nProvider`):**

- Añadir `ru` al mapa de diccionarios (`{ ro, es, ru }`).
- Aceptar prop opcional `invitado`. Al montar, se registra si la URL traía
  un `?lang=` explícito y válido (igual que hoy, para no pisar la elección
  manual del enlace). Un `useEffect` sobre `invitado` hace: si
  `invitado?.idioma` está presente, es distinto del idioma activo, y no
  hubo `?lang=` explícito en la URL → `cambiarIdioma(invitado.idioma)`.
  Así la invitación se abre en el idioma que el admin fijó al crearla, salvo
  que el enlace compartido llevara su propio `?lang=`.

**`src/i18n/ru.js` (nuevo):** mismo shape que `ro.js`/`es.js`, traducción
completa de todas las claves (nav, carta, banda, hero, intro, familia,
contador, detalii incluida la nueva `ceremonie`, program, galerie, rsvp,
footer). Nombres propios (Bianca, Florentin, lugares) sin traducir, igual
que en los otros dos diccionarios.

**`src/components/Idiomas.jsx`:**

- Acepta prop `variante` (`'sin_misa' | 'con_misa'`, default `'sin_misa'`).
- El diccionario `BANDERAS` gana entrada `ru` (bandera rusa: franjas
  horizontales blanco/azul/rojo).
- Renderiza solo las banderas relevantes: `['ro', 'es']` si `sin_misa`,
  `['ro', 'ru', 'es']` si `con_misa`.

**`src/components/Detalles.jsx`:**

- Acepta prop `invitado`.
- Si `invitado?.variante === 'con_misa'`, renderiza un `<Dia>` adicional
  *antes* del de la Recepción, con los datos de `CEREMONIA` de
  `wedding.js` y `foto={FOTO_CEREMONIA}`.
- Las etiquetas de texto (`eticheta`, `ora`, `data`, botón de mapa) salen de
  `t('detalii.ceremonie.*')`, ya presente en los diccionarios pero con
  contenido desactualizado (fecha 8 de agosto, iglesia "Biserica Neagră").
  Se reescribe con los datos reales del 5 de agosto.

**`src/config/wedding.js`:**

- Actualizar `CEREMONIA`:
  ```js
  export const CEREMONIA = {
    fechaISO: '2027-08-05T11:00:00+03:00',
    horaConfirmada: false,
    direccionConfirmada: true,
    lugar: 'Biserica Ortodoxă de Rit Vechi «Vovidenia»',
    direccion: 'Strada Reșița 76, Brăila',
    mapsLink: 'https://maps.app.goo.gl/TZY2cbGt27xjeFCRA?g_st=iw',
  }
  ```
- Añadir `export const FOTO_CEREMONIA = '/misa.jpeg'` (ya existe, revisar si
  ya está declarada — actualmente sí lo está, solo hay que confirmar que
  apunta al archivo correcto).
- Actualizar el comentario que dice "tendrá su propia invitación aparte" ya
  que deja de ser cierto.

**Contenido i18n `detalii.ceremonie` (reescritura):**

| clave | es | ro | ru |
|---|---|---|---|
| eticheta | La ceremonia religiosa | Cununia religioasă | Венчание |
| fechaGrande | 5 de agosto | 5 august | 5 августа |
| data | jueves, 5 de agosto de 2027 | joi, 5 august 2027 | четверг, 5 августа 2027 |
| ora | 11:00 h (hora por confirmar) | ora 11:00 (se confirmă) | 11:00 (время уточняется) |

(`direccionNota` no se usa aquí: la dirección ya es conocida; solo la hora
está pendiente y se indica inline en `ora`.)

## Testing / verificación

- `npm run build` sin errores.
- Manual en local:
  - Invitación `sin_misa` existente: sin cambios visibles, 2 banderas.
  - Crear invitación `con_misa` desde el admin → popup de idioma → aparece
    en el listado con la bandera correcta.
  - Abrir el enlace de una invitación `con_misa` en los 3 idiomas (por
    `idioma` guardado y por `?lang=` en el enlace compartido) y comprobar
    que aparece la tarjeta del 5 de agosto con foto, dirección y mapa.
  - Comprobar que el popup de compartir ofrece 2 idiomas en `sin_misa` y 3
    en `con_misa`.
