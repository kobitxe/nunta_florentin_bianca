import { useI18n } from '../i18n/context.js'
import { nombresDe } from '../lib/nombres.js'
import { Rosas } from './Decor.jsx'

export default function Hero({ invitado }) {
  const { t } = useI18n()

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

      <h1 className="hero__nombres">
        Florentin <span className="hero__amp">&amp;</span> Bianca
      </h1>

      <div className="hero__fechabar">
        <span>{t('hero.luna')}</span>
        <span className="hero__fechabar-dias">5 &amp; 8</span>
        <span>2027</span>
      </div>
      <p className="hero__ciudades">{t('hero.orase')}</p>
    </section>
  )
}
