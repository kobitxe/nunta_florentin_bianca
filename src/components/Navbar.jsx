import { useI18n } from '../i18n/context.js'

export default function Navbar() {
  const { idioma, cambiarIdioma, t } = useI18n()

  return (
    <header className="navbar">
      <a className="navbar__logo" href="#top">
        Flo <em>&amp;</em> Bianca
      </a>

      <nav className="navbar__links">
        <a href="#detalii">{t('nav.detalii')}</a>
        {/* <a href="#program">{t('nav.program')}</a> */}
        {/* <a href="#galerie">{t('nav.galerie')}</a> */}
        <a href="#rsvp">{t('nav.rsvp')}</a>
      </nav>

      <div className="idiomas" role="group" aria-label="Limba / Idioma">
        {['ro', 'es'].map((cod) => (

          
          <button
            key={cod}
            type="button"
            className={`idiomas__btn${idioma === cod ? ' activo' : ''}`}
            aria-pressed={idioma === cod}
            onClick={() => cambiarIdioma(cod)}
          >
            {cod.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  )
}
