import { useI18n } from '../i18n/context.js'
import Reveal from './Reveal.jsx'
import { Rasgado } from './Decor.jsx'

// Cita de apertura, justo debajo del hero: reafirma el "sí" con
// los nombres y un párrafo a modo de dedicatoria.
export default function IntroCita() {
  const { t } = useI18n()

  return (
    <section className="seccion intro-cita">
      <Rasgado className="seccion__corte seccion__corte--papel" />
      <div className="seccion__inner intro-cita__inner">
        <Reveal>
          <p className="intro-cita__cita">{t('intro.cita')}</p>
          <p className="intro-cita__nombres">
            Bianca <span className="intro-cita__amp">&amp;</span> Florentin
          </p>
          <p className="intro-cita__parrafo">{t('intro.parrafo')}</p>
        </Reveal>
      </div>
    </section>
  )
}
