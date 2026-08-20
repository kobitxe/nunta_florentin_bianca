import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context.js'
import { CEREMONIA } from '../config/wedding.js'
import { nombresDe } from '../lib/nombres.js'
import { Rosas } from './Decor.jsx'

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

export default function Hero({ invitado }) {
  const { t } = useI18n()
  const [tiempo, setTiempo] = useState(restante)

  useEffect(() => {
    const timer = setInterval(() => setTiempo(restante()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero" id="top">
      <Rosas className="hero__rosas hero__rosas--tl" />
      <Rosas className="hero__rosas hero__rosas--br" />

      {invitado && (
        <p className="hero__saludo">
          {t('hero.holaPre')}
          {nombresDe(invitado)}!
        </p>
      )}
      <p className="hero__anuncio">{t('hero.anunt')}</p>

      <div className="hero__arco">
        <img src="/novios.jpeg" alt="Flo & Bianca" />
      </div>

      <h1 className="hero__nombres">Flo &amp; Bianca</h1>

      <div className="hero__fechabar">
        <span>{t('hero.luna')}</span>
        <span className="hero__fechabar-dias">5 &amp; 8</span>
        <span>2027</span>
      </div>
      <p className="hero__ciudades">{t('hero.orase')}</p>

      {tiempo && (
        <div className="countdown" aria-label={t('hero.countdown.titlu')}>
          <p className="countdown__titulo">{t('hero.countdown.titlu')}</p>
          <div className="countdown__cifras">
            {['zile', 'ore', 'minute', 'secunde'].map((unidad) => (
              <div className="countdown__bloque" key={unidad}>
                <div className="countdown__num">{tiempo[unidad]}</div>
                <div className="countdown__label">{t(`hero.countdown.${unidad}`)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <a className="hero__cta" href="#rsvp">
        {t('hero.cta')}
      </a>
    </section>
  )
}
