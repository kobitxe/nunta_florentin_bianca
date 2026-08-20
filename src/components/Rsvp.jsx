import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context.js'
import { supabase, obtenerRsvp, guardarRsvp } from '../lib/supabase.js'
import { nombresDe } from '../lib/nombres.js'
import Reveal from './Reveal.jsx'
import { Rasgado } from './Decor.jsx'

// La invitación es personal: el invitado llega con /i/{token} y su nombre
// viene de la URL, así que el formulario no pide datos personales.
export default function Rsvp({ token, invitado, cargando }) {
  const { t } = useI18n()
  const [yaRespondio, setYaRespondio] = useState(false)
  const [asiste, setAsiste] = useState(null)
  const [restricciones, setRestricciones] = useState('')
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
        setMensaje(previo.mensaje || '')
      })
      .catch(() => {})
    return () => {
      activo = false
    }
  }, [invitado])

  const esPareja = invitado?.tipo === 'pareja'
  const nombres = invitado ? nombresDe(invitado) : ''

  const onSubmit = async (e) => {
    e.preventDefault()
    if (asiste === null) return
    setEstado('enviando')
    try {
      await guardarRsvp({
        invitadoId: invitado.id,
        esPareja,
        asiste,
        restricciones: restricciones.trim(),
        mensaje: mensaje.trim(),
      })
      setEstado('ok')
      setYaRespondio(true)
    } catch {
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
  } else {
    contenido = (
      <Reveal>
        <h3 className="rsvp__saludo">
          <span className="rsvp__nombres">{nombres}</span>
          {esPareja ? t('rsvp.saludoPareja') : t('rsvp.saludoIndividual')}
        </h3>

        {yaRespondio && estado !== 'ok' && <p className="aviso aviso--info">{t('rsvp.yaRespondido')}</p>}

        <form onSubmit={onSubmit}>
          <div className="campo">
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

          {asiste === true && (
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

          {asiste !== null && (
            <div className="campo">
              <label htmlFor="rsvp-mensaje">{t('rsvp.mensaje')}</label>
              <textarea
                id="rsvp-mensaje"
                placeholder={t('rsvp.mensajePlaceholder')}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
            </div>
          )}

          <button className="rsvp__enviar" type="submit" disabled={asiste === null || estado === 'enviando'}>
            {estado === 'enviando' ? t('rsvp.enviando') : t('rsvp.enviar')}
          </button>

          {estado === 'ok' && (
            <p className="aviso aviso--ok" role="status">
              {asiste ? t('rsvp.gracias') : t('rsvp.graciasNo')}
            </p>
          )}
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
      <Rasgado className="seccion__corte seccion__corte--marfil" />
      <div className="seccion__inner rsvp">
        <Reveal>
          <p className="eyebrow">{t('rsvp.eyebrow')}</p>
          <h2 className="titulo">{t('rsvp.titlu')}</h2>
          <p className="rsvp__intro">{t('rsvp.intro')}</p>
        </Reveal>
        {contenido}
      </div>
    </section>
  )
}
