import { useI18n } from '../i18n/context.js'
import { GALERIA_FOTOS } from '../config/wedding.js'
import Reveal from './Reveal.jsx'
import { Rasgado } from './Decor.jsx'

const PLACEHOLDERS = 4

export default function Galeria() {
  const { t } = useI18n()
  const hayFotos = GALERIA_FOTOS.length > 0

  return (
    <section className="seccion seccion--marfil" id="galerie">
      <Rasgado className="seccion__corte seccion__corte--papel" />
      <div className="seccion__inner">
        <Reveal>
          <p className="eyebrow">{t('galerie.eyebrow')}</p>
          <h2 className="titulo">{t('galerie.titlu')}</h2>
        </Reveal>
        <Reveal>
          <div className="galeria">
            {hayFotos
              ? GALERIA_FOTOS.map((url, i) => (
                  <figure className="galeria__item" key={url}>
                    <img src={url} alt={`Bianca & Florentin ${i + 1}`} loading="lazy" />
                  </figure>
                ))
              : Array.from({ length: PLACEHOLDERS }, (_, i) => (
                  <div className="galeria__item" key={i} aria-hidden="true">
                    <div className="galeria__placeholder">F&amp;B</div>
                  </div>
                ))}
          </div>
          {!hayFotos && <p className="galeria__nota">{t('galerie.inCurand')}</p>}
        </Reveal>
      </div>
    </section>
  )
}
