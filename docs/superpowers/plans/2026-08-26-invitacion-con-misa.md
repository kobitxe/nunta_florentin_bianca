# Segunda variante de invitación "Con Misa" (RO/RU/ES) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir una segunda variante de invitación ("con_misa") que incluye la tarjeta de la cununia religioasă del 5 de agosto en Brăila y soporta tres idiomas (rumano/ruso/español), con el flujo correspondiente en el panel de administración.

**Architecture:** Dos columnas nuevas en `invitados` (`variante`, `idioma`) gobiernan qué ve el sitio público (tarjeta extra en Detalles, idioma inicial, banderas disponibles) y qué banderita se muestra en el listado del admin. El panel admin pide el idioma en un popup antes de crear una invitación `con_misa`. Todo el resto del código (RSVP, estadísticas, tokens) queda igual.

**Tech Stack:** React 19 + Vite, Supabase (Postgres + Auth), sin framework de testing (el proyecto no tiene test runner instalado — la verificación es `npm run build` + comprobación manual en `npm run dev`, siguiendo el patrón ya establecido en este repo).

**Spec:** `docs/superpowers/specs/2026-08-26-invitacion-con-misa-design.md`

## Global Constraints

- No introducir ningún framework de testing nuevo: este repo no tiene uno y no es parte del alcance. La verificación de cada tarea es `npm run build` (debe compilar sin errores) más los pasos manuales descritos en la propia tarea.
- Idiomas soportados: `ro` (rumano, por defecto), `es` (español), `ru` (ruso). Variantes de invitación: `sin_misa` (por defecto, comportamiento actual) y `con_misa`.
- Datos reales de la misa (no inventar otros): fecha `2027-08-05T11:00:00+03:00`, lugar `Biserica Ortodoxă de Rit Vechi «Vovidenia»`, dirección `Strada Reșița 76, Brăila`, maps `https://maps.app.goo.gl/TZY2cbGt27xjeFCRA?g_st=iw`, foto `/misa.jpeg` (ya existe en `public/`). Hora pendiente de confirmar — se muestra como "11:00 (por confirmar)" / equivalentes.
- Seguir el estilo del código existente: componentes funcionales, nombres de variables en español, sin comentarios explicativos salvo que documenten un porqué no obvio (patrón ya usado en `wedding.js`, `nombres.js`, `Carta.jsx`).
- No tocar el flujo de RSVP, estadísticas del admin, ni las políticas RLS existentes.

---

### Task 1: Base de datos — migración y capa de acceso (`supabase.js`)

**Files:**
- Create: `supabase/migration-003-invitacion-con-misa.sql`
- Modify: `src/lib/supabase.js:12-21` (`buscarInvitadoPorToken`), `src/lib/supabase.js:61-75` (`crearInvitacion`)

**Interfaces:**
- Produces: `buscarInvitadoPorToken(token)` ahora resuelve `{ id, nombre, nombre_pareja, tipo, variante, idioma }`.
- Produces: `crearInvitacion({ tipo, nombre, nombrePareja, variante, idioma })` — `variante` es `'sin_misa' | 'con_misa'`; `idioma` es `'ro'|'es'|'ru'|null`.

- [ ] **Step 1: Crear la migración SQL**

```sql
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
```

- [ ] **Step 2: Actualizar `buscarInvitadoPorToken` en `src/lib/supabase.js`**

Reemplaza:

```js
export async function buscarInvitadoPorToken(token) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('invitados')
    .select('id, nombre, nombre_pareja, tipo')
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  return data
}
```

por:

```js
export async function buscarInvitadoPorToken(token) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('invitados')
    .select('id, nombre, nombre_pareja, tipo, variante, idioma')
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  return data
}
```

- [ ] **Step 3: Actualizar `crearInvitacion` en `src/lib/supabase.js`**

Reemplaza:

```js
export async function crearInvitacion({ tipo, nombre, nombrePareja }) {
  if (!supabase) throw new Error('supabase-not-configured')
  // Los dos nombres de una pareja se unen con "_" (slug() nunca produce
  // ese carácter) para poder distinguirlos luego en nombreDesdeToken()
  // y reconstruir el "&" antes de que responda el backend.
  const base = tipo === 'pareja' ? `${slug(nombre)}_${slug(nombrePareja)}` : slug(nombre)
  const token = `${base}-${Math.random().toString(36).slice(2, 6)}`
  const { data, error } = await supabase
    .from('invitados')
    .insert({ nombre, nombre_pareja: tipo === 'pareja' ? nombrePareja : null, tipo, token })
    .select()
    .single()
  if (error) throw error
  return data
}
```

por:

```js
export async function crearInvitacion({ tipo, nombre, nombrePareja, variante, idioma }) {
  if (!supabase) throw new Error('supabase-not-configured')
  // Los dos nombres de una pareja se unen con "_" (slug() nunca produce
  // ese carácter) para poder distinguirlos luego en nombreDesdeToken()
  // y reconstruir el "&" antes de que responda el backend.
  const base = tipo === 'pareja' ? `${slug(nombre)}_${slug(nombrePareja)}` : slug(nombre)
  const token = `${base}-${Math.random().toString(36).slice(2, 6)}`
  const { data, error } = await supabase
    .from('invitados')
    .insert({
      nombre,
      nombre_pareja: tipo === 'pareja' ? nombrePareja : null,
      tipo,
      token,
      variante,
      idioma: idioma ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
```

- [ ] **Step 4: Verificar que compila**

Run: `npm run build`
Expected: build verde, sin errores (Admin.jsx todavía llama a `crearInvitacion` con la firma vieja hasta la Tarea 6 — eso es solo un desajuste de tipos en tiempo de ejecución, no rompe la compilación de Vite).

- [ ] **Step 5: Commit**

```bash
git add supabase/migration-003-invitacion-con-misa.sql src/lib/supabase.js
git commit -m "feat: columnas variante/idioma en invitados y soporte en supabase.js"
```

---

### Task 2: Banderas compartidas y selector de idioma con 2/3 opciones

**Files:**
- Create: `src/lib/banderas.jsx`
- Modify: `src/components/Idiomas.jsx` (reescritura completa)

**Interfaces:**
- Produces: `export const BANDERAS` desde `src/lib/banderas.jsx` — objeto `{ ro: { nombre, svg }, es: { nombre, svg }, ru: { nombre, svg } }`. Consumido por `Idiomas.jsx` (Tarea 2) y por `Admin.jsx` (Tarea 6).
- Consumes: nada nuevo (usa `useI18n` de `src/i18n/context.js`, ya existente).
- Produces: `<Idiomas variante="sin_misa" | "con_misa" />` (prop opcional, default `'sin_misa'`).

- [ ] **Step 1: Crear `src/lib/banderas.jsx`**

```jsx
// Banderas como SVG inline: escalan con el contenedor y se recortan en
// círculo con overflow hidden. Compartidas entre el selector de idioma
// público (Idiomas.jsx) y la banderita del listado del panel admin.
export const BANDERAS = {
  ro: {
    nombre: 'Română',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1" height="2" fill="#002B7F" />
        <rect x="1" width="1" height="2" fill="#FCD116" />
        <rect x="2" width="1" height="2" fill="#CE1126" />
      </svg>
    ),
  },
  es: {
    nombre: 'Español',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="3" height="2" fill="#AA151B" />
        <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      </svg>
    ),
  },
  ru: {
    nombre: 'Русский',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="3" height="0.6667" fill="#FFFFFF" />
        <rect y="0.6667" width="3" height="0.6667" fill="#0039A6" />
        <rect y="1.3334" width="3" height="0.6666" fill="#D52B1E" />
      </svg>
    ),
  },
}
```

- [ ] **Step 2: Reescribir `src/components/Idiomas.jsx`**

Contenido completo:

```jsx
import { useI18n } from '../i18n/context.js'
import { BANDERAS } from '../lib/banderas.jsx'

const ORDEN_POR_VARIANTE = {
  sin_misa: ['ro', 'es'],
  con_misa: ['ro', 'ru', 'es'],
}

// Selector de idioma flotante: la bandera activa a todo color, las demás
// apagadas hasta que se pasa por encima o se selecciona. Las invitaciones
// "con misa" muestran también la bandera rusa.
export default function Idiomas({ variante = 'sin_misa' }) {
  const { idioma, cambiarIdioma } = useI18n()
  const codigos = ORDEN_POR_VARIANTE[variante] ?? ORDEN_POR_VARIANTE.sin_misa

  return (
    <div className="idiomas" role="group" aria-label="Limba / Idioma / Язык">
      {codigos.map((cod) => {
        const { nombre, svg } = BANDERAS[cod]
        return (
          <button
            key={cod}
            type="button"
            className={`idiomas__btn${idioma === cod ? ' activo' : ''}`}
            aria-pressed={idioma === cod}
            aria-label={nombre}
            title={nombre}
            onClick={() => cambiarIdioma(cod)}
          >
            {svg}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npm run build`
Expected: build verde.

- [ ] **Step 4: Verificación manual rápida**

Run: `npm run dev`, abre `http://localhost:5173/`.
Expected: el selector de idioma sigue mostrando 2 banderas (RO/ES) igual que antes, en la esquina superior derecha, y sigue cambiando el idioma de la página al pulsarlas.

- [ ] **Step 5: Commit**

```bash
git add src/lib/banderas.jsx src/components/Idiomas.jsx
git commit -m "refactor: extraer banderas a módulo compartido y soportar 3 idiomas en el selector"
```

---

### Task 3: Idioma ruso completo (`ru.js`)

**Files:**
- Create: `src/i18n/ru.js`

**Interfaces:**
- Produces: `export default { nav, carta, banda, hero, intro, familia, contador, detalii, program, galerie, rsvp, footer }` — mismo shape exacto que `src/i18n/es.js` y `src/i18n/ro.js` (todas las mismas claves, sin claves de más ni de menos).
- Consumes: ninguna dependencia de otras tareas.

- [ ] **Step 1: Crear `src/i18n/ru.js`**

```js
export default {
  nav: {
    detalii: 'Детали',
    program: 'Программа',
    galerie: 'Галерея',
    rsvp: 'Подтвердить',
  },
  carta: {
    abrir: 'Открыть приглашение',
    ajutor: 'Нажмите на печать, чтобы открыть',
    para: 'Для',
  },
  banda: {
    texto: 'Венчание · 8 августа 2027 · Biserica Neagră',
  },
  hero: {
    holaPre: 'Привет, ',
    luna: 'августа',
    anunt: 'Мы женимся',
    si: '&',
    datele: '8 августа 2027',
    orase: 'Мамая',
    countdown: {
      titlu: 'До венчания',
      zile: 'дней',
      ore: 'часов',
      minute: 'минут',
      secunde: 'секунд',
    },
    cta: 'Подтвердить участие',
  },
  intro: {
    cita: 'С сердцами, полными радости и волнения, мы готовимся сказать «ДА»',
    parrafo:
      'Любовь привела нас сюда, и обещание общей жизни ведёт к самому прекрасному началу. Сегодня начинается самая красивая часть нашей истории: жизнь, которую мы будем жить вместе, навсегда.',
  },
  familia: {
    citaParinti: 'С любовью и благословением наших родителей наша любовь начинает свою самую прекрасную главу',
    citaNasi: 'В новой главе нашей истории рядом с нами будут дорогие нам люди',
    nasiEticheta: 'Наши крёстные',
    memoria: 'в память о',
  },
  contador: {
    banner: {
      dia: 'Воскресенье',
      fecha: '8 августа 2027',
      hora: '17:00',
    },
    teaser: 'Ещё немного, и «мы двое» станем «мужем и женой»! А пока будем вместе считать каждое мгновение.',
  },
  detalii: {
    eyebrow: 'Один день — навсегда',
    titlu: 'День свадьбы',
    ceremonie: {
      eticheta: 'Венчание',
      fechaGrande: '5 августа',
      data: 'четверг, 5 августа 2027',
      ora: '11:00 (время уточняется)',
      direccionNota: 'Точное время скоро подтвердят',
    },
    receptie: {
      eticheta: 'Место проведения',
      fechaGrande: '8 августа',
      data: 'воскресенье, 8 августа 2027',
      ora: '17:00',
    },
    ventMapa: 'Открыть в Google Maps',
  },
  program: {
    eyebrow: 'Программа дней',
    titlu: 'Как мы будем праздновать',
    zi1: '5 августа — Брэила',
    zi2: '8 августа — Мамая',
    evenimente1: [
      { ora: '10:30', text: 'Прибытие гостей в церковь' },
      { ora: '11:00', text: 'Венчание' },
      { ora: '12:30', text: 'Поздравления и фотографии' },
    ],
    evenimente2: [
      { ora: '17:00', text: 'Встреча гостей на террасе' },
      { ora: '18:00', text: 'Аперитив с видом на море' },
      { ora: '19:30', text: 'Праздничный ужин' },
      { ora: '21:00', text: 'Первый танец' },
      { ora: '00:00', text: 'Свадебный торт' },
    ],
  },
  galerie: {
    eyebrow: 'Наша история',
    titlu: 'Фотогалерея',
    inCurand: 'Фотографии скоро появятся здесь.',
  },
  rsvp: {
    eyebrow: 'Мы вас ждём',
    titlu: 'Подтвердить участие',
    intro: 'Мы хотим, чтобы вы стали частью нашей истории. Пожалуйста, подтвердите своё участие до 1 июля 2027 года.',
    saludoIndividual: ', приглашаем тебя на нашу свадьбу!',
    saludoPareja: ', приглашаем вас на нашу свадьбу!',
    preguntaIndividual: 'Будешь с нами?',
    preguntaPareja: 'Будете с нами?',
    da: 'Да, я буду там',
    nu: 'К сожалению, не смогу',
    daPareja: 'Да, мы будем там',
    nuPareja: 'К сожалению, не сможем',
    restricciones: 'Аллергии или пищевые непереносимости (необязательно)',
    restriccionesPlaceholder: 'например, вегетарианец, аллергия на орехи…',
    mensaje: 'Сообщение для жениха и невесты (необязательно)',
    mensajePlaceholder: 'Напишите нам несколько слов…',
    enviar: 'Отправить подтверждение',
    enviando: 'Отправка…',
    gracias: 'Спасибо! Подтверждение получено.',
    graciasNo: 'Спасибо, что сообщили. Нам будет вас не хватать!',
    error: 'Не удалось отправить подтверждение. Попробуйте ещё раз.',
    cargando: 'Загрузка приглашения…',
    sinToken: 'Приглашение именное. Если вы не получили свою ссылку, спросите у жениха и невесты.',
    noEncontrado: 'Мы не нашли это приглашение. Проверьте полученную ссылку.',
    yaRespondido: 'Вы уже ответили — вы можете изменить ответ в любое время.',
    sinConfig: 'Форма скоро заработает.',
    contactoAyuda: 'Если форма не работает или у вас есть вопросы, напишите или позвоните нам:',
  },
  footer: {
    frase: 'С любовью ждём вас, чтобы отпраздновать вместе.',
    firma: 'Bianca & Florentin · 8 августа 2027',
  },
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: build verde (el archivo aún no se importa desde ningún sitio, así que solo se valida sintaxis JS).

- [ ] **Step 3: Commit**

```bash
git add src/i18n/ru.js
git commit -m "feat: traducción completa al ruso (best-effort, pendiente de revisión nativa)"
```

---

### Task 4: Conectar el ruso al `I18nProvider` y sincronizar el idioma del invitado

**Files:**
- Modify: `src/i18n/index.jsx` (reescritura completa)

**Interfaces:**
- Consumes: `src/i18n/ru.js` default export (Tarea 3).
- Produces: `<I18nProvider invitado={invitado}>` — prop `invitado` opcional, shape `{ idioma?: 'ro'|'es'|'ru', ... }`. El contexto expuesto (`idioma`, `cambiarIdioma`, `t`) no cambia de forma.

- [ ] **Step 1: Reescribir `src/i18n/index.jsx`**

Contenido completo:

```jsx
import { useEffect, useRef, useState } from 'react'
import { I18nContext } from './context.js'
import ro from './ro.js'
import es from './es.js'
import ru from './ru.js'

const diccionarios = { ro, es, ru }
const STORAGE_KEY = 'boda-idioma'

export function I18nProvider({ children, invitado }) {
  // Si el enlace trae ?lang= explícito, manda sobre cualquier idioma
  // guardado en la invitación (el admin lo usa para forzar un idioma
  // puntual al compartir, sin tocar el idioma guardado del invitado).
  const langParamRef = useRef(null)

  const [idioma, setIdioma] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('lang')
    if (param in diccionarios) {
      langParamRef.current = param
      return param
    }
    const guardado = localStorage.getItem(STORAGE_KEY)
    return guardado in diccionarios ? guardado : 'ro'
  })

  const cambiarIdioma = (nuevo) => {
    setIdioma(nuevo)
    localStorage.setItem(STORAGE_KEY, nuevo)
    document.documentElement.lang = nuevo
  }

  // Cuando llegan los datos del invitado (fetch async en App.jsx) y trae
  // un idioma guardado, se adopta como idioma de la página — salvo que el
  // enlace ya forzara uno explícito con ?lang=.
  useEffect(() => {
    if (!invitado?.idioma) return
    if (langParamRef.current) return
    if (!(invitado.idioma in diccionarios)) return
    setIdioma((actual) => {
      if (actual === invitado.idioma) return actual
      localStorage.setItem(STORAGE_KEY, invitado.idioma)
      document.documentElement.lang = invitado.idioma
      return invitado.idioma
    })
  }, [invitado])

  // t('rsvp.titlu') → valor del diccionario activo, con fallback a rumano.
  const t = (clave) => {
    const buscar = (dic) => clave.split('.').reduce((nodo, k) => nodo?.[k], dic)
    return buscar(diccionarios[idioma]) ?? buscar(ro) ?? clave
  }

  return <I18nContext.Provider value={{ idioma, cambiarIdioma, t }}>{children}</I18nContext.Provider>
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: build verde.

- [ ] **Step 3: Verificación manual**

Run: `npm run dev`, abre `http://localhost:5173/?lang=ru`.
Expected: la página carga en ruso (textos del hero, nav, etc. en cirílico) porque `?lang=` sigue funcionando como antes.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/index.jsx
git commit -m "feat: soportar diccionario ruso y sincronizar idioma con el guardado en la invitación"
```

---

### Task 5: Datos y tarjeta de la misa del 5 de agosto

**Files:**
- Modify: `src/config/wedding.js` (líneas 1-13, comentario + `CEREMONIA`)
- Modify: `src/i18n/es.js:54-60`, `src/i18n/ro.js:54-60` (bloque `detalii.ceremonie`)
- Modify: `src/components/Detalles.jsx` (reescritura completa)

**Interfaces:**
- Consumes: `CEREMONIA` de `wedding.js`; claves `detalii.ceremonie.*` de los diccionarios i18n (ya existen, se actualiza su contenido).
- Produces: `<Detalles invitado={invitado} />` — prop `invitado` opcional, usa `invitado?.variante`.

- [ ] **Step 1: Actualizar el comentario y `CEREMONIA` en `src/config/wedding.js`**

Reemplaza las líneas 1-13:

```js
// Datos reales de la boda. Un único punto de verdad para fechas y lugares.
// La misa del 5 de agosto en Brăila tendrá su propia invitación aparte
// (en ruso/rumano); esta invitación cubre solo el día del 8 de agosto.

export const CEREMONIA = {
  fechaISO: '2027-08-08T16:00:00+03:00',
  horaConfirmada: true,
  // Dirección aún pendiente: Bianca la pasará más adelante.
  direccionConfirmada: false,
  lugar: 'Biserica Neagră',
  direccion: null,
  mapsLink: null,
}
```

por:

```js
// Datos reales de la boda. Un único punto de verdad para fechas y lugares.
// La invitación "con misa" (variante/idioma en la tabla invitados) añade
// la tarjeta de la cununia religioasă del 5 de agosto; la invitación base
// ("sin misa") solo muestra el día 8 de agosto.

export const CEREMONIA = {
  fechaISO: '2027-08-05T11:00:00+03:00',
  // Hora provisional (~11:00): pendiente de confirmación final.
  horaConfirmada: false,
  direccionConfirmada: true,
  lugar: 'Biserica Ortodoxă de Rit Vechi «Vovidenia»',
  direccion: 'Strada Reșița 76, Brăila',
  mapsLink: 'https://maps.app.goo.gl/TZY2cbGt27xjeFCRA?g_st=iw',
}
```

- [ ] **Step 2: Actualizar `detalii.ceremonie` en `src/i18n/es.js`**

Reemplaza:

```js
    ceremonie: {
      eticheta: 'El programa del día',
      fechaGrande: '8 de agosto',
      data: 'domingo, 8 de agosto de 2027',
      ora: 'Ceremonia religiosa · 16:00 h',
      direccionNota: 'La dirección exacta se confirmará pronto',
    },
```

por:

```js
    ceremonie: {
      eticheta: 'La ceremonia religiosa',
      fechaGrande: '5 de agosto',
      data: 'jueves, 5 de agosto de 2027',
      ora: '11:00 h (hora por confirmar)',
      direccionNota: 'La hora exacta se confirmará en los próximos días',
    },
```

- [ ] **Step 3: Actualizar `detalii.ceremonie` en `src/i18n/ro.js`**

Reemplaza:

```js
    ceremonie: {
      eticheta: 'Programul zilei',
      fechaGrande: '8 august',
      data: 'duminică, 8 august 2027',
      ora: 'Cununia religioasă · ora 16:00',
      direccionNota: 'Adresa exactă va fi confirmată în curând',
    },
```

por:

```js
    ceremonie: {
      eticheta: 'Cununia religioasă',
      fechaGrande: '5 august',
      data: 'joi, 5 august 2027',
      ora: 'ora 11:00 (se confirmă)',
      direccionNota: 'Ora exactă se confirmă în curând',
    },
```

- [ ] **Step 4: Reescribir `src/components/Detalles.jsx`**

Contenido completo:

```jsx
import { useI18n } from '../i18n/context.js'
import { CEREMONIA, RECEPCION, FOTO_CEREMONIA, FOTO_RECEPCION } from '../config/wedding.js'
import Reveal from './Reveal.jsx'
import { Rasgado } from './Decor.jsx'

// Banda horizontal de un día: fecha grande, datos y foto del sitio.
// El mapa se muestra como un botón que abre Google Maps, no como iframe.
function Dia({ etiqueta, fechaGrande, lugar, direccion, fecha, hora, nota, mapsLink, foto }) {
  const { t } = useI18n()
  return (
    <article className="dia">
      <div className="dia__info">
        <p className="dia__etiqueta">{etiqueta}</p>
        <h3 className="dia__fecha">{fechaGrande}</h3>
        <p className="dia__anio">2027</p>
        <h4 className="dia__lugar">{lugar}</h4>
        {direccion && <p className="dia__dato">{direccion}</p>}
        <p className="dia__dato">
          {fecha} · {hora}
        </p>
        {nota && <p className="dia__nota">{nota}</p>}
        {mapsLink && (
          <a className="dia__boton-mapa" href={mapsLink} target="_blank" rel="noreferrer">
            {t('detalii.ventMapa')} ↗
          </a>
        )}
      </div>
      <div className="dia__foto">
        <p className="dia__foto-titulo">{lugar}</p>
        <div className="dia__foto-marco">
          <img src={foto} alt={lugar} loading="lazy" />
        </div>
      </div>
    </article>
  )
}

export default function Detalles({ invitado }) {
  const { t } = useI18n()
  const conMisa = invitado?.variante === 'con_misa'

  return (
    <section className="seccion seccion--marfil" id="detalii">
      <Rasgado className="seccion__corte seccion__corte--oscuro" />
      <div className="seccion__inner">
        <Reveal>
          <p className="eyebrow">{t('detalii.eyebrow')}</p>
          <h2 className="titulo">{t('detalii.titlu')}</h2>
        </Reveal>

        {conMisa && (
          <Reveal>
            <Dia
              etiqueta={t('detalii.ceremonie.eticheta')}
              fechaGrande={t('detalii.ceremonie.fechaGrande')}
              lugar={CEREMONIA.lugar}
              direccion={CEREMONIA.direccion}
              fecha={t('detalii.ceremonie.data')}
              hora={t('detalii.ceremonie.ora')}
              mapsLink={CEREMONIA.mapsLink}
              foto={FOTO_CEREMONIA}
            />
          </Reveal>
        )}

        <Reveal>
          <Dia
            etiqueta={t('detalii.receptie.eticheta')}
            fechaGrande={t('detalii.receptie.fechaGrande')}
            lugar={RECEPCION.lugar}
            direccion={RECEPCION.direccion}
            fecha={t('detalii.receptie.data')}
            hora={t('detalii.receptie.ora')}
            mapsLink={RECEPCION.mapsLink}
            foto={FOTO_RECEPCION}
          />
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Verificar que compila**

Run: `npm run build`
Expected: build verde.

- [ ] **Step 6: Verificación manual**

Run: `npm run dev`, abre `http://localhost:5173/`.
Expected: la sección "Detalles" se ve exactamente igual que antes (sin `invitado`, `conMisa` es `false`, no aparece la tarjeta de la misa).

- [ ] **Step 7: Commit**

```bash
git add src/config/wedding.js src/i18n/es.js src/i18n/ro.js src/components/Detalles.jsx
git commit -m "feat: datos reales de la misa del 5 de agosto y tarjeta condicional en Detalles"
```

---

### Task 6: Conectar `invitado` en `App.jsx`

**Files:**
- Modify: `src/App.jsx` (reescritura completa)

**Interfaces:**
- Consumes: `I18nProvider` con prop `invitado` (Tarea 4), `Idiomas` con prop `variante` (Tarea 2), `Detalles` con prop `invitado` (Tarea 5).

- [ ] **Step 1: Reescribir `src/App.jsx`**

Contenido completo:

```jsx
import { useEffect, useState } from 'react'
import { I18nProvider } from './i18n/index.jsx'
import { buscarInvitadoPorToken } from './lib/supabase.js'
import Carta from './components/Carta.jsx'
import Idiomas from './components/Idiomas.jsx'
import Hero from './components/Hero.jsx'
import IntroCita from './components/IntroCita.jsx'
import Familia from './components/Familia.jsx'
import Contador from './components/Contador.jsx'
import Detalles from './components/Detalles.jsx'
import Rsvp from './components/Rsvp.jsx'
import Footer from './components/Footer.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const ruta = window.location.pathname
  // Invitación personalizada: /i/{token}
  const token = ruta.startsWith('/i/') ? decodeURIComponent(ruta.slice(3).replace(/\/$/, '')) : null

  const [invitado, setInvitado] = useState(null)
  const [cargandoInvitado, setCargandoInvitado] = useState(Boolean(token))

  useEffect(() => {
    if (!token) return
    buscarInvitadoPorToken(token)
      .then(setInvitado)
      .catch(() => setInvitado(null))
      .finally(() => setCargandoInvitado(false))
  }, [token])

  if (ruta === '/admin') return <Admin />

  return (
    <I18nProvider invitado={invitado}>
      <Carta invitado={invitado} token={token} />
      <Idiomas variante={invitado?.variante ?? 'sin_misa'} />
      <main>
        <Hero invitado={invitado} />
        <IntroCita />
        <Familia />
        <Contador />
        <Detalles invitado={invitado} />
        <Rsvp token={token} invitado={invitado} cargando={cargandoInvitado} />
      </main>
      <Footer />
    </I18nProvider>
  )
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npm run build`
Expected: build verde.

- [ ] **Step 3: Verificación manual**

Run: `npm run dev`, abre `http://localhost:5173/` (sin token).
Expected: la web se ve y funciona exactamente igual que antes de este plan (invitado es `null`, variante por defecto `sin_misa`, 2 banderas, sin tarjeta de misa).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: propagar invitado/variante a I18nProvider, Idiomas y Detalles"
```

---

### Task 7: Panel admin — variante, popup de idioma al crear y banderita en el listado

**Files:**
- Modify: `src/pages/Admin.jsx` (reescritura completa)
- Modify: `src/index.css` (nuevas reglas + ajustes de grid)

**Interfaces:**
- Consumes: `BANDERAS` de `src/lib/banderas.jsx` (Tarea 2), `crearInvitacion({ tipo, nombre, nombrePareja, variante, idioma })` (Tarea 1).

- [ ] **Step 1: Reescribir `src/pages/Admin.jsx`**

Contenido completo:

```jsx
import { useCallback, useEffect, useState } from 'react'
import {
  supabase,
  crearInvitacion,
  listarInvitaciones,
  borrarInvitacion,
  fijarAsistencia,
  suscribirRsvps,
} from '../lib/supabase.js'
import { BANDERAS } from '../lib/banderas.jsx'

const urlDe = (token, lang) => `${window.location.origin}/i/${token}${lang ? `?lang=${lang}` : ''}`
const nombresDe = (inv) => (inv.tipo === 'pareja' ? `${inv.nombre} & ${inv.nombre_pareja}` : inv.nombre)

const IDIOMAS_LABEL = { ro: 'Rumano', es: 'Español', ru: 'Ruso' }
const IDIOMAS_POR_VARIANTE = { sin_misa: ['ro', 'es'], con_misa: ['ro', 'ru', 'es'] }

function mensajeCompartir(inv, lang) {
  const nombres = nombresDe(inv)
  const url = urlDe(inv.token, lang)
  if (lang === 'ro') {
    return inv.tipo === 'pareja'
      ? `Dragi ${nombres}, vă invităm cu drag la nunta noastră (Bianca & Florentin), 8 august 2027. Deschideți invitația voastră aici: ${url}`
      : `Dragă ${nombres}, te invităm cu drag la nunta noastră (Bianca & Florentin), 8 august 2027. Deschide invitația ta aici: ${url}`
  }
  if (lang === 'ru') {
    return inv.tipo === 'pareja'
      ? `Дорогие ${nombres}, приглашаем вас на нашу свадьбу (Bianca & Florentin), 8 августа 2027 года. Откройте своё приглашение здесь: ${url}`
      : `Дорогой(ая) ${nombres}, приглашаем тебя на нашу свадьбу (Bianca & Florentin), 8 августа 2027 года. Открой своё приглашение здесь: ${url}`
  }
  return inv.tipo === 'pareja'
    ? `Hola ${nombres}, nos encantaría que nos acompañarais en nuestra boda (Bianca & Florentin), 8 de agosto de 2027. Abrid vuestra invitación aquí: ${url}`
    : `Hola ${nombres}, nos encantaría que nos acompañaras en nuestra boda (Bianca & Florentin), 8 de agosto de 2027. Abre tu invitación aquí: ${url}`
}

const linkWhatsApp = (inv, lang) => `https://wa.me/?text=${encodeURIComponent(mensajeCompartir(inv, lang))}`

// Popup genérico "¿en qué idioma?", reutilizado tanto para compartir un
// enlace ya creado como para elegir el idioma al crear una invitación
// "con misa" (antes de guardarla).
function ModalIdioma({ titulo, pregunta, idiomas, onElegir, onCancelar }) {
  return (
    <div className="modal" onClick={onCancelar}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        <h3>{titulo}</h3>
        <p>{pregunta}</p>
        <div className="modal__opciones">
          {idiomas.map((cod) => (
            <button key={cod} className="rsvp__enviar" type="button" onClick={() => onElegir(cod)}>
              {IDIOMAS_LABEL[cod]}
            </button>
          ))}
        </div>
        <button className="btn-mini" type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError('Email o contraseña incorrectos.')
    setEnviando(false)
  }

  return (
    <div className="login">
      <h1>Panel de la boda</h1>
      <form onSubmit={onSubmit}>
        <div className="campo">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="login-pass">Contraseña</label>
          <input
            id="login-pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="rsvp__enviar" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        {error && <p className="aviso aviso--error">{error}</p>}
      </form>
    </div>
  )
}

function estadoDe(inv) {
  const r = inv.rsvps?.[0]
  if (!r) return 'pendiente'
  return r.asiste ? 'si' : 'no'
}

function Panel({ email }) {
  const [lista, setLista] = useState([])
  const [error, setError] = useState(null)
  const [tipo, setTipo] = useState('individual')
  const [variante, setVariante] = useState('sin_misa')
  const [nombre, setNombre] = useState('')
  const [nombrePareja, setNombrePareja] = useState('')
  const [creando, setCreando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [dialogo, setDialogo] = useState(null) // { inv, accion: 'copiar' | 'whatsapp' }
  const [crearPendiente, setCrearPendiente] = useState(null) // datos del formulario a falta del idioma

  const refrescar = useCallback(() => {
    listarInvitaciones()
      .then((datos) => {
        setLista(datos)
        setError(null)
      })
      .catch(() => setError('No se pudo cargar la lista. ¿Ejecutaste la migración SQL?'))
  }, [])

  useEffect(() => {
    refrescar()
    return suscribirRsvps(refrescar)
  }, [refrescar])

  const ejecutarCreacion = async (datos) => {
    setCreando(true)
    try {
      await crearInvitacion(datos)
      setNombre('')
      setNombrePareja('')
      setVariante('sin_misa')
      refrescar()
    } catch {
      setError('No se pudo crear la invitación.')
    } finally {
      setCreando(false)
    }
  }

  const onCrear = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || (tipo === 'pareja' && !nombrePareja.trim())) return
    const datos = { tipo, nombre: nombre.trim(), nombrePareja: nombrePareja.trim(), variante }
    if (variante === 'con_misa') {
      setCrearPendiente(datos)
      return
    }
    await ejecutarCreacion({ ...datos, idioma: null })
  }

  const elegirIdiomaCreacion = async (lang) => {
    const datos = crearPendiente
    setCrearPendiente(null)
    await ejecutarCreacion({ ...datos, idioma: lang })
  }

  const onBorrar = async (inv) => {
    if (!window.confirm(`¿Borrar la invitación de ${nombresDe(inv)}? También se borra su respuesta.`)) return
    try {
      await borrarInvitacion(inv.id)
      refrescar()
    } catch {
      setError('No se pudo borrar la invitación.')
    }
  }

  const onEstado = async (inv, estado) => {
    try {
      await fijarAsistencia(inv, estado)
      refrescar()
    } catch {
      setError('No se pudo cambiar el estado.')
    }
  }

  // Copiar y WhatsApp preguntan primero el idioma; el enlace lleva ?lang=
  // para que la invitación se abra directamente en ese idioma. No cambia
  // el idioma guardado del invitado, solo el del enlace puntual.
  const elegirIdioma = async (lang) => {
    const { inv, accion } = dialogo
    setDialogo(null)
    if (accion === 'copiar') {
      await navigator.clipboard.writeText(urlDe(inv.token, lang))
      setCopiado(inv.id)
      setTimeout(() => setCopiado(null), 1500)
    } else {
      window.open(linkWhatsApp(inv, lang), '_blank', 'noopener')
    }
  }

  const confirmadas = lista.filter((i) => estadoDe(i) === 'si')
  const stats = [
    { num: lista.length, label: 'invitaciones' },
    { num: confirmadas.length, label: 'han dicho sí' },
    { num: lista.filter((i) => estadoDe(i) === 'no').length, label: 'han dicho no' },
    { num: lista.filter((i) => estadoDe(i) === 'pendiente').length, label: 'pendientes' },
    { num: confirmadas.reduce((sum, i) => sum + (i.tipo === 'pareja' ? 2 : 1), 0), label: 'personas confirmadas' },
  ]

  return (
    <div className="admin__inner">
      <div className="admin__head">
        <h1>Panel de la boda</h1>
        <div className="admin__sesion">
          <span className="tabla__detalle">{email}</span>
          <button className="btn-mini" type="button" onClick={() => supabase.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="stats stats--admin">
        {stats.map((s) => (
          <div className="stats__celda" key={s.label}>
            <div className="stats__num">{s.num}</div>
            <div className="stats__label">{s.label}</div>
          </div>
        ))}
      </div>

      <form className="crear" onSubmit={onCrear}>
        <h2>Nueva invitación</h2>
        <div className="crear__fila">
          <div className="campo">
            <label htmlFor="crear-tipo">Tipo</label>
            <select id="crear-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="individual">Individual (Estás invitado)</option>
              <option value="pareja">Pareja (Estáis invitados)</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="crear-variante">Invitación</label>
            <select id="crear-variante" value={variante} onChange={(e) => setVariante(e.target.value)}>
              <option value="sin_misa">Sin Misa</option>
              <option value="con_misa">Con Misa</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="crear-nombre">Nombre</label>
            <input
              id="crear-nombre"
              type="text"
              required
              placeholder="p. ej. Dani"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          {tipo === 'pareja' && (
            <div className="campo">
              <label htmlFor="crear-pareja">Su pareja</label>
              <input
                id="crear-pareja"
                type="text"
                required
                placeholder="p. ej. Alejandra"
                value={nombrePareja}
                onChange={(e) => setNombrePareja(e.target.value)}
              />
            </div>
          )}
        </div>
        <button className="rsvp__enviar" type="submit" disabled={creando}>
          {creando ? 'Creando…' : 'Crear enlace'}
        </button>
      </form>

      {error && <p className="aviso aviso--error">{error}</p>}

      <h2 className="admin__subtitulo">Invitaciones creadas</h2>
      {lista.length === 0 ? (
        <p className="aviso aviso--info">Todavía no hay invitaciones. Crea la primera arriba.</p>
      ) : (
        <ul className="lista-inv">
          {lista.map((inv) => {
            const estado = estadoDe(inv)
            const r = inv.rsvps?.[0]
            return (
              <li className="inv-card" key={inv.id}>
                <div className="inv-card__top">
                  <strong className="inv-card__nombre">{nombresDe(inv)}</strong>
                  <span className="chip chip--tipo">{inv.tipo}</span>
                  {inv.variante === 'con_misa' && (
                    <span className="chip chip--tipo">Con Misa</span>
                  )}
                  {inv.variante === 'con_misa' && inv.idioma && BANDERAS[inv.idioma] && (
                    <span className="bandera-mini" title={BANDERAS[inv.idioma].nombre}>
                      {BANDERAS[inv.idioma].svg}
                    </span>
                  )}
                  {estado === 'si' && <span className="chip chip--si">Sí</span>}
                  {estado === 'no' && <span className="chip chip--no">No</span>}
                  {estado === 'pendiente' && <span className="chip chip--pend">Pendiente</span>}
                </div>
                {r?.restricciones && <div className="tabla__detalle">🍽 {r.restricciones}</div>}
                {r?.mensaje && <div className="tabla__detalle">💬 {r.mensaje}</div>}
                <div className="acciones">
                  <button className="btn-mini" type="button" onClick={() => setDialogo({ inv, accion: 'copiar' })}>
                    {copiado === inv.id ? '✓ Copiado' : '🔗 Copiar enlace'}
                  </button>
                  <label className="estado-editar">
                    Estado:
                    <select value={estado} onChange={(e) => onEstado(inv, e.target.value)}>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                      <option value="pendiente">Pendiente</option>
                    </select>
                  </label>
                  <button className="btn-mini btn-mini--borrar" type="button" onClick={() => onBorrar(inv)}>
                    Borrar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {dialogo && (
        <ModalIdioma
          titulo={dialogo.accion === 'copiar' ? 'Copiar enlace' : 'Enviar por WhatsApp'}
          pregunta={
            <>
              ¿En qué idioma para <strong>{nombresDe(dialogo.inv)}</strong>?
            </>
          }
          idiomas={IDIOMAS_POR_VARIANTE[dialogo.inv.variante] ?? IDIOMAS_POR_VARIANTE.sin_misa}
          onElegir={elegirIdioma}
          onCancelar={() => setDialogo(null)}
        />
      )}

      {crearPendiente && (
        <ModalIdioma
          titulo="Nueva invitación"
          pregunta={
            <>
              ¿En qué idioma quieres que le aparezca a{' '}
              <strong>
                {crearPendiente.tipo === 'pareja'
                  ? `${crearPendiente.nombre} & ${crearPendiente.nombrePareja}`
                  : crearPendiente.nombre}
              </strong>
              ?
            </>
          }
          idiomas={IDIOMAS_POR_VARIANTE.con_misa}
          onElegir={elegirIdiomaCreacion}
          onCancelar={() => setCrearPendiente(null)}
        />
      )}
    </div>
  )
}

export default function Admin() {
  const [sesion, setSesion] = useState(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setListo(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, nueva) => setSesion(nueva))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <div className="admin">
        <p className="aviso aviso--info">Supabase no está configurado (revisa las variables de entorno).</p>
      </div>
    )
  }

  return <div className="admin">{!listo ? null : sesion ? <Panel email={sesion.user?.email} /> : <Login />}</div>
}
```

- [ ] **Step 2: Añadir estilos en `src/index.css`**

Añade después de la regla `.chip--tipo` (busca ese bloque):

```css
.bandera-mini {
  display: inline-flex;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  overflow: hidden;
  flex: none;
}

.bandera-mini svg {
  display: block;
  width: 100%;
  height: 100%;
}
```

Y ajusta el grid de `.crear__fila` (dentro del `@media (min-width: 48rem)`) para que quepan hasta 4 campos (Tipo, Invitación, Nombre, Pareja). Reemplaza:

```css
@media (min-width: 48rem) {
  .crear__fila {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }
```

por:

```css
@media (min-width: 48rem) {
  .crear__fila {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 1rem;
  }
```

Y ajusta `.modal__opciones` para que quepan hasta 3 botones (Rumano/Ruso/Español) sin quedar apretados. Reemplaza:

```css
.modal__opciones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-bottom: 1rem;
}
```

por:

```css
.modal__opciones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npm run build`
Expected: build verde.

- [ ] **Step 4: Verificación manual (requiere Supabase configurado y migración 003 ejecutada)**

Run: `npm run dev`, entra en `http://localhost:5173/admin`, inicia sesión.
Expected:
- El formulario "Nueva invitación" muestra el nuevo select "Invitación" (Sin Misa/Con Misa).
- Crear una invitación "Sin Misa" funciona exactamente igual que antes (sin popup).
- Crear una invitación "Con Misa" abre el popup "¿En qué idioma...?" con 3 botones (Rumano/Ruso/Español); al elegir uno se crea la invitación.
- La tarjeta de esa invitación en el listado muestra el chip "Con Misa" y la banderita del idioma elegido.
- El botón "Copiar enlace" de una invitación "Con Misa" ofrece 3 idiomas; el de una "Sin Misa" ofrece 2, como antes.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Admin.jsx src/index.css
git commit -m "feat: variante y popup de idioma al crear invitaciones, banderita en el listado"
```

---

### Task 8: Documentación y verificación final end-to-end

**Files:**
- Modify: `README.md`

**Interfaces:** ninguna (documentación).

- [ ] **Step 1: Actualizar `README.md`**

Reemplaza la línea 3:

```
Invitación web bilingüe (rumano/castellano) para la boda de Flo & Bianca.
```

por:

```
Invitación web para la boda de Flo & Bianca, con dos variantes: la base (rumano/castellano) y "Con Misa" (rumano/ruso/castellano, añade la cununia religioasă del 5 de agosto).
```

Reemplaza el punto 1 de "Configuración (una vez, tras `setup.sql`)":

```
1. **SQL Editor**: ejecuta [`supabase/migration-002-invitaciones.sql`](supabase/migration-002-invitaciones.sql). Añade token/tipo a `invitados` y ajusta RLS (solo el admin crea invitados; el invitado solo guarda su respuesta).
```

por:

```
1. **SQL Editor**: ejecuta [`supabase/migration-002-invitaciones.sql`](supabase/migration-002-invitaciones.sql) y luego [`supabase/migration-003-invitacion-con-misa.sql`](supabase/migration-003-invitacion-con-misa.sql). Añaden token/tipo/variante/idioma a `invitados` y ajustan RLS (solo el admin crea invitados; el invitado solo guarda su respuesta).
```

Reemplaza la línea de "Textos rumano/castellano" en "Contenido editable":

```
- **Textos rumano/castellano:** `src/i18n/ro.js` y `src/i18n/es.js` (incluido el programa del día).
```

por:

```
- **Textos rumano/castellano/ruso:** `src/i18n/ro.js`, `src/i18n/es.js` y `src/i18n/ru.js` (incluido el programa del día). La invitación "Sin Misa" solo usa rumano/castellano; la variante "Con Misa" añade el ruso y la tarjeta de la misa del 5 de agosto.
```

Y añade una frase al final del párrafo de la sección "Invitaciones personalizadas y panel de administración" (después de "También se pueden borrar invitaciones."):

```
Al crear una invitación se elige también la variante (Sin Misa / Con Misa); si es "Con Misa", un segundo paso pide el idioma (rumano/ruso/castellano), que queda guardado y se muestra como una banderita en el listado.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: documentar la variante Con Misa y la migración 003"
```

- [ ] **Step 3: Verificación final end-to-end**

Run: `npm run build`
Expected: build verde.

Manual (con Supabase configurado, las 3 migraciones ejecutadas y `npm run dev`):

1. `http://localhost:5173/` → invitación base sin cambios visibles, 2 banderas.
2. `/admin` → crear invitación "Sin Misa" → aparece en el listado sin banderita, con chip de tipo únicamente.
3. `/admin` → crear invitación "Con Misa" → popup de 3 idiomas → elegir "Ruso" → aparece en el listado con chip "Con Misa" + banderita rusa.
4. Copiar el enlace de esa invitación y abrirlo: la página se abre en ruso, con la tarjeta de la misa (foto `misa.jpeg`, iglesia, dirección, botón de mapa con el enlace correcto) antes de la tarjeta de la recepción, y el selector de idioma muestra 3 banderas.
5. En esa misma invitación, pulsar la bandera RO y luego ES del selector: el resto del contenido (nav, hero, RSVP, footer) cambia de idioma correctamente en los 3 casos.
6. Desde el admin, "Copiar enlace" de esa invitación "Con Misa" → el popup ofrece 3 idiomas; elegir uno distinto al guardado → el enlace copiado lleva ese `?lang=`, pero la banderita del listado no cambia (sigue mostrando el idioma guardado en la creación).

- [ ] **Step 4: Recordatorio para el usuario (no es una tarea de código)**

Avisar de que falta ejecutar manualmente en Supabase (Dashboard → SQL Editor) el archivo `supabase/migration-003-invitacion-con-misa.sql` antes de que el flujo funcione en producción/staging, y que la traducción rusa de `src/i18n/ru.js` es best-effort y conviene que la revise un hablante nativo (p. ej. Vladaca) antes de mandar invitaciones reales.
