import { useI18n } from '../i18n/context.js'
import { CEREMONIA, RECEPCION } from '../config/wedding.js'
import Reveal from './Reveal.jsx'

function Tarjeta({ dia, etiqueta, lugar, direccion, fecha, hora, nota, mapsEmbed, mapsLink }) {
  const { t } = useI18n()
  return (
    <article className="tarjeta">
      <div className="tarjeta__dia">{dia}</div>
      <p className="tarjeta__etiqueta">{etiqueta}</p>
      <h3 className="tarjeta__lugar">{lugar}</h3>
      <p className="tarjeta__dato">{direccion}</p>
      <p className="tarjeta__dato">
        {fecha} · {hora}
      </p>
      {nota && <p className="tarjeta__nota">{nota}</p>}
      <div className="tarjeta__mapa">
        <iframe src={mapsEmbed} title={lugar} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <a className="tarjeta__enlace" href={mapsLink} target="_blank" rel="noreferrer">
        {t('detalii.ventMapa')} ↗
      </a>
    </article>
  )
}

export default function Detalles() {
  const { t } = useI18n()

  return (
    <section className="seccion seccion--beige" id="detalii">
      <div className="seccion__inner">
        <Reveal>
          <p className="eyebrow">{t('detalii.eyebrow')}</p>
          <h2 className="titulo">{t('detalii.titlu')}</h2>
        </Reveal>
        <Reveal>
          <div className="diptico">
            <Tarjeta
              dia="05"
              etiqueta={t('detalii.ceremonie.eticheta')}
              lugar={CEREMONIA.lugar}
              direccion={CEREMONIA.direccion}
              fecha={t('detalii.ceremonie.data')}
              hora={t('detalii.ceremonie.ora')}
              nota={!CEREMONIA.horaConfirmada ? t('detalii.ceremonie.oraNota') : null}
              mapsEmbed={CEREMONIA.mapsEmbed}
              mapsLink={CEREMONIA.mapsLink}
            />
            <Tarjeta
              dia="08"
              etiqueta={t('detalii.receptie.eticheta')}
              lugar={RECEPCION.lugar}
              direccion={RECEPCION.direccion}
              fecha={t('detalii.receptie.data')}
              hora={t('detalii.receptie.ora')}
              mapsEmbed={RECEPCION.mapsEmbed}
              mapsLink={RECEPCION.mapsLink}
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
