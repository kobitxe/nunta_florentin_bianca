import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context.js'
import { supabase, obtenerRsvp, guardarRsvp } from '../lib/supabase.js'
import { nombresDe } from '../lib/nombres.js'
import { CONTACTO } from '../config/wedding.js'
import Reveal from './Reveal.jsx'
import { EnviadoCheck } from './Decor.jsx'

const MAX_NINOS = 6
const EDAD_MAX = 12
// Valor guardado para "menos de 1 año": siempre esta cadena (en español,
// como el panel de los novios), aunque el formulario se rellene en otro
// idioma; así el panel lo lee igual y al reabrir la invitación el <select>
// vuelve a marcar la opción correcta.
const EDAD_MENOR_1 = 'Menos de 1 año'

// La invitación es personal: el invitado llega con /i/{token} y su nombre
// viene de la URL, así que el formulario no pide datos personales.
export default function Rsvp({ token, invitado, cargando }) {
  const { t } = useI18n()
  const [yaRespondio, setYaRespondio] = useState(false)
  const [asiste, setAsiste] = useState(true)
  const [restricciones, setRestricciones] = useState('')
  const [numNinos, setNumNinos] = useState(0)
  // Una edad por niño, en el mismo orden que se muestran ("Niño 1", "Niño 2"…).
  const [edadesNinos, setEdadesNinos] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [estado, setEstado] = useState('idle') // idle | enviando | ok | error

  useEffect(() => {
    if (!invitado) return
    let activo = true
    obtenerRsvp(invitado.id)
      .then((previo) => {
        if (!activo || !previo) return
        setYaRespondio(true)
        setAsiste(previo.asiste)
        setRestricciones(previo.restricciones || '')
        const num = previo.num_ninos || 0
        const edades = (previo.edades_ninos || '').split(',').map((s) => s.trim())
        setNumNinos(num)
        setEdadesNinos(Array.from({ length: num }, (_, i) => edades[i] ?? ''))
        setMensaje(previo.mensaje || '')
      })
      .catch(() => {})
    return () => {
      activo = false
    }
  }, [invitado])

  const esPareja = invitado?.tipo === 'pareja'
  const nombres = invitado ? nombresDe(invitado) : ''

  // Al cambiar el número de niños se conservan las edades ya elegidas y solo
  // se añaden/quitan selectores al final.
  const cambiarNumNinos = (raw) => {
    const n = Math.max(0, Math.min(MAX_NINOS, Math.floor(Number(raw) || 0)))
    setNumNinos(n)
    setEdadesNinos((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? ''))
  }

  const cambiarEdadNino = (indice, valor) => {
    setEdadesNinos((prev) => {
      const copia = Array.from({ length: numNinos }, (_, i) => prev[i] ?? '')
      copia[indice] = valor
      return copia
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setEstado('enviando')
    try {
      await guardarRsvp({
        invitadoId: invitado.id,
        esPareja,
        asiste,
        restricciones: restricciones.trim(),
        numNinos: asiste ? numNinos : 0,
        edadesNinos:
          asiste && numNinos > 0
            ? edadesNinos.slice(0, numNinos).map((s) => s.trim()).filter(Boolean).join(', ')
            : '',
        mensaje: mensaje.trim(),
      })
      setEstado('ok')
      setYaRespondio(true)
    } catch (err) {
      console.error('guardarRsvp falló:', err)
      setEstado('error')
    }
  }

  let contenido
  if (!supabase) {
    contenido = <p className="aviso aviso--info">{t('rsvp.sinConfig')}</p>
  } else if (!token) {
    contenido = <p className="aviso aviso--info">{t('rsvp.sinToken')}</p>
  } else if (cargando) {
    contenido = <p className="aviso aviso--info">{t('rsvp.cargando')}</p>
  } else if (!invitado) {
    contenido = <p className="aviso aviso--info">{t('rsvp.noEncontrado')}</p>
  } else if (estado === 'ok') {
    // Tras enviar, se oculta el formulario entero (nada de inputs) y se
    // muestra solo la confirmación con el check animado.
    contenido = (
      <Reveal>
        <div className="rsvp__enviado" role="status">
          <EnviadoCheck />
          <p className="rsvp__enviado-texto">{asiste ? t('rsvp.gracias') : t('rsvp.graciasNo')}</p>
        </div>
      </Reveal>
    )
  } else {
    contenido = (
      <Reveal>
        <h3 className="rsvp__saludo">
          <span className="rsvp__nombres">{nombres}</span>
          {esPareja ? t('rsvp.saludoPareja') : t('rsvp.saludoIndividual')}
        </h3>

        {yaRespondio && <p className="aviso aviso--info">{t('rsvp.yaRespondido')}</p>}

        <form onSubmit={onSubmit}>
          <div className="campo">
            <br></br>
            <label>{esPareja ? t('rsvp.preguntaPareja') : t('rsvp.preguntaIndividual')}</label>
            <div className="asiste" role="group">
              <button
                type="button"
                className={`asiste__opcion${asiste === true ? ' activo' : ''}`}
                aria-pressed={asiste === true}
                onClick={() => setAsiste(true)}
              >
                {esPareja ? t('rsvp.daPareja') : t('rsvp.da')}
              </button>
              <button
                type="button"
                className={`asiste__opcion${asiste === false ? ' activo' : ''}`}
                aria-pressed={asiste === false}
                onClick={() => setAsiste(false)}
              >
                {esPareja ? t('rsvp.nuPareja') : t('rsvp.nu')}
              </button>
            </div>
          </div>

          {asiste && (
            <div className="campo">
              <label htmlFor="rsvp-restricciones">{t('rsvp.restricciones')}</label>
              <input
                id="rsvp-restricciones"
                type="text"
                placeholder={t('rsvp.restriccionesPlaceholder')}
                value={restricciones}
                onChange={(e) => setRestricciones(e.target.value)}
              />
            </div>
          )}

          {asiste && (
            <div className="campo">
              <label htmlFor="rsvp-ninos">{t('rsvp.ninosPregunta')}</label>
              <input
                id="rsvp-ninos"
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_NINOS}
                value={numNinos}
                onChange={(e) => cambiarNumNinos(e.target.value)}
              />
            </div>
          )}

          {asiste && numNinos > 0 && (
            <div className="campo">
              <label>{t('rsvp.ninosEdades')}</label>
              <div className="ninos-edades">
                {Array.from({ length: numNinos }).map((_, i) => (
                  <div className="ninos-edades__fila" key={i}>
                    <span className="ninos-edades__etiqueta" id={`rsvp-nino-${i}`}>
                      {t('rsvp.ninosHijo')} {i + 1}
                    </span>
                    <select
                      aria-labelledby={`rsvp-nino-${i}`}
                      value={edadesNinos[i] ?? ''}
                      onChange={(e) => cambiarEdadNino(i, e.target.value)}
                    >
                      <option value="">—</option>
                      <option value={EDAD_MENOR_1}>{t('rsvp.ninosMenor1')}</option>
                      {Array.from({ length: EDAD_MAX }, (_, k) => k + 1).map((edad) => (
                        <option key={edad} value={String(edad)}>
                          {edad}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="campo">
            <label htmlFor="rsvp-mensaje">{t('rsvp.mensaje')}</label>
            <textarea
              id="rsvp-mensaje"
              placeholder={t('rsvp.mensajePlaceholder')}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>

          <button className="rsvp__enviar" type="submit" disabled={estado === 'enviando'}>
            {estado === 'enviando' ? t('rsvp.enviando') : t('rsvp.enviar')}
          </button>

          {estado === 'error' && (
            <p className="aviso aviso--error" role="status">
              {t('rsvp.error')}
            </p>
          )}
        </form>
      </Reveal>
    )
  }

  return (
    <section className="seccion" id="rsvp">
      <div className="seccion__inner rsvp">
        <Reveal>
          <h2 className="titulo">{t('rsvp.titlu')}</h2>
          <p className="rsvp__intro">{t('rsvp.intro')}</p>
        </Reveal>
        {contenido}
        <p className="rsvp__contacto">
          {t('rsvp.contactoAyuda')}
          <br />
          <a href={`tel:${CONTACTO.bianca.tel}`}>
            {CONTACTO.bianca.nombre} · {CONTACTO.bianca.numero}
          </a>
          {' · '}
          <a href={`tel:${CONTACTO.florentin.tel}`}>
            {CONTACTO.florentin.nombre} · {CONTACTO.florentin.numero}
          </a>
        </p>
      </div>
    </section>
  )
}
