import { useState } from 'react'
import { useI18n } from '../i18n/context.js'
import { supabase, enviarRsvp } from '../lib/supabase.js'
import Reveal from './Reveal.jsx'

const FORM_INICIAL = {
  nombre: '',
  email: '',
  telefono: '',
  asiste: true,
  numAcompanantes: 0,
  restricciones: '',
  mensaje: '',
}

export default function Rsvp() {
  const { t } = useI18n()
  const [form, setForm] = useState(FORM_INICIAL)
  const [estado, setEstado] = useState('idle') // idle | enviando | ok | error
  const [aviso, setAviso] = useState(null)

  const setCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setEstado('error')
      setAviso(t('rsvp.faltaNombre'))
      return
    }
    setEstado('enviando')
    setAviso(null)
    try {
      await enviarRsvp({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        asiste: form.asiste,
        numAcompanantes: form.asiste ? Number(form.numAcompanantes) : 0,
        restricciones: form.restricciones.trim(),
        mensaje: form.mensaje.trim(),
      })
      setEstado('ok')
      setAviso(form.asiste ? t('rsvp.gracias') : t('rsvp.graciasNo'))
      setForm(FORM_INICIAL)
    } catch {
      setEstado('error')
      setAviso(t('rsvp.error'))
    }
  }

  return (
    <section className="seccion" id="rsvp">
      <div className="seccion__inner rsvp">
        <Reveal>
          <p className="eyebrow">{t('rsvp.eyebrow')}</p>
          <h2 className="titulo">{t('rsvp.titlu')}</h2>
          <p className="rsvp__intro">{t('rsvp.intro')}</p>
        </Reveal>

        {!supabase ? (
          <p className="aviso aviso--info">{t('rsvp.sinConfig')}</p>
        ) : (
          <Reveal>
            <form onSubmit={onSubmit} noValidate>
              <div className="campo">
                <label htmlFor="rsvp-nombre">{t('rsvp.nume')}</label>
                <input
                  id="rsvp-nombre"
                  type="text"
                  required
                  placeholder={t('rsvp.numePlaceholder')}
                  value={form.nombre}
                  onChange={setCampo('nombre')}
                />
              </div>

              <div className="campo">
                <label htmlFor="rsvp-email">{t('rsvp.email')}</label>
                <input id="rsvp-email" type="email" value={form.email} onChange={setCampo('email')} />
              </div>

              <div className="campo">
                <label htmlFor="rsvp-telefono">{t('rsvp.telefon')}</label>
                <input id="rsvp-telefono" type="tel" value={form.telefono} onChange={setCampo('telefono')} />
              </div>

              <div className="campo">
                <label>{t('rsvp.asistencia')}</label>
                <div className="asiste" role="group" aria-label={t('rsvp.asistencia')}>
                  <button
                    type="button"
                    className={`asiste__opcion${form.asiste ? ' activo' : ''}`}
                    aria-pressed={form.asiste}
                    onClick={() => setForm({ ...form, asiste: true })}
                  >
                    {t('rsvp.da')}
                  </button>
                  <button
                    type="button"
                    className={`asiste__opcion${!form.asiste ? ' activo' : ''}`}
                    aria-pressed={!form.asiste}
                    onClick={() => setForm({ ...form, asiste: false })}
                  >
                    {t('rsvp.nu')}
                  </button>
                </div>
              </div>

              {form.asiste && (
                <>
                  <div className="campo">
                    <label htmlFor="rsvp-acomp">{t('rsvp.acompanantes')}</label>
                    <select id="rsvp-acomp" value={form.numAcompanantes} onChange={setCampo('numAcompanantes')}>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="campo">
                    <label htmlFor="rsvp-restricciones">{t('rsvp.restricciones')}</label>
                    <input
                      id="rsvp-restricciones"
                      type="text"
                      placeholder={t('rsvp.restriccionesPlaceholder')}
                      value={form.restricciones}
                      onChange={setCampo('restricciones')}
                    />
                  </div>
                </>
              )}

              <div className="campo">
                <label htmlFor="rsvp-mensaje">{t('rsvp.mensaje')}</label>
                <textarea
                  id="rsvp-mensaje"
                  placeholder={t('rsvp.mensajePlaceholder')}
                  value={form.mensaje}
                  onChange={setCampo('mensaje')}
                />
              </div>

              <button className="rsvp__enviar" type="submit" disabled={estado === 'enviando'}>
                {estado === 'enviando' ? t('rsvp.enviando') : t('rsvp.enviar')}
              </button>

              {aviso && (
                <p className={`aviso ${estado === 'ok' ? 'aviso--ok' : 'aviso--error'}`} role="status">
                  {aviso}
                </p>
              )}
            </form>
          </Reveal>
        )}
      </div>
    </section>
  )
}
