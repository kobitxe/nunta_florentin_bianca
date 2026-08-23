import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context.js'
import { CEREMONIA } from '../config/wedding.js'
import { Rasgado } from './Decor.jsx'

function restante() {
  const diff = new Date(CEREMONIA.fechaISO) - Date.now()
  if (diff <= 0) return null
  return {
    zile: Math.floor(diff / 86400000),
    ore: Math.floor(diff / 3600000) % 24,
    minute: Math.floor(diff / 60000) % 60,
    secunde: Math.floor(diff / 1000) % 60,
  }
}

// Cuenta atrás hasta la ceremonia, en su propio contenedor bajo el hero.
export default function Contador() {
  const { t } = useI18n()
  const [tiempo, setTiempo] = useState(restante)

  useEffect(() => {
    const timer = setInterval(() => setTiempo(restante()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!tiempo) return null

  return (
    <section className="contador-seccion" aria-label={t('hero.countdown.titlu')}>
      <Rasgado className="seccion__corte seccion__corte--marfil" />
      <div className="contador">
        <div className="contador__banner">
          <span>{t('contador.banner.dia')}</span>
          <span className="contador__banner-fecha">{t('contador.banner.fecha')}</span>
          <span>{t('contador.banner.hora')}</span>
        </div>
        <p className="contador__teaser">{t('contador.teaser')}</p>
        <p className="eyebrow">{t('hero.countdown.titlu')}</p>
        <div className="countdown__cifras">
          {['zile', 'ore', 'minute', 'secunde'].map((unidad) => (
            <div className="countdown__bloque" key={unidad}>
              <div className="countdown__num">{tiempo[unidad]}</div>
              <div className="countdown__label">{t(`hero.countdown.${unidad}`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
