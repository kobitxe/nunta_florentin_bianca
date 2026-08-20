import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../i18n/context.js'
import { supabase, cargarStats, suscribirRsvps } from '../lib/supabase.js'
import Reveal from './Reveal.jsx'

export default function Stats() {
  const { t } = useI18n()
  const [stats, setStats] = useState(null)

  const refrescar = useCallback(() => {
    cargarStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  useEffect(() => {
    refrescar()
    return suscribirRsvps(refrescar)
  }, [refrescar])

  const celdas = stats
    ? [
        { num: stats.confirmados, label: t('stats.confirmados') },
        { num: stats.totalPersonas, label: t('stats.personas') },
        { num: stats.respuestas, label: t('stats.respuestas') },
        { num: stats.noAsisten, label: t('stats.noAsisten') },
      ]
    : []

  return (
    <section className="seccion seccion--beige" id="stats">
      <div className="seccion__inner">
        <Reveal>
          <p className="eyebrow">{t('stats.eyebrow')}</p>
          <h2 className="titulo">{t('stats.titlu')}</h2>
        </Reveal>
        <Reveal>
          {!supabase ? (
            <p className="aviso aviso--info">{t('stats.sinConfig')}</p>
          ) : stats && stats.respuestas > 0 ? (
            <div className="stats">
              {celdas.map((c) => (
                <div className="stats__celda" key={c.label}>
                  <div className="stats__num">{c.num}</div>
                  <div className="stats__label">{c.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="aviso aviso--info">{t('stats.vacio')}</p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
