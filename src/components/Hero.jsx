import { useI18n } from '../i18n/context.js'
import { nombresDe } from '../lib/nombres.js'
import { Rosas } from './Decor.jsx'

export default function Hero({ invitado }) {
  const { t } = useI18n()

  return (
    <section className="hero" id="top">
      <img className="hero__foto-fondo" src="/novios.jpeg" alt="" aria-hidden="true" />
      <img className="hero__foto" src="/novios.jpeg" alt="" aria-hidden="true" />
      <div className="hero__velo" />
      <Rosas className="hero__rosas hero__rosas--tl" />
      <Rosas className="hero__rosas hero__rosas--br" />

      <div className="hero__contenido">
        <div className="hero__arriba">
          {invitado && (
            <p className="hero__saludo">
              {t('hero.holaExcl') ? (
                <span className="hero__saludo-excl hero__saludo-excl--ini">{t('hero.holaExcl')}</span>
              ) : null}
              {t('hero.holaPre')}
              {nombresDe(invitado)}
              <span className="hero__saludo-excl">!</span>
            </p>
          )}
          <p className="hero__anuncio">{t('hero.anunt')}</p>
        </div>

        <div className="hero__abajo">
          <h1 className="hero__nombres">
            Bianca <span className="hero__amp">&amp;</span> Florentin
          </h1>

          <div className="hero__fechabar">
            <span>{t('hero.luna')}</span>
            <span className="hero__fechabar-dias">8</span>
            <span>2027</span>
          </div>
          <p className="hero__ciudades">{t('hero.orase')}</p>
        </div>
      </div>
    </section>
  )
}
