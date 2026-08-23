import { useI18n } from '../i18n/context.js'
import { CEREMONIA, RECEPCION, FOTOS_CEREMONIA, FOTOS_RECEPCION } from '../config/wedding.js'
import Reveal from './Reveal.jsx'
import { Rasgado } from './Decor.jsx'
import Carrusel from './Carrusel.jsx'

// Banda horizontal de un día: fecha grande, datos, mapa y carrusel.
// Si no hay mapsEmbed (dirección aún sin confirmar), se oculta el mapa
// y la tarjeta pasa a una sola columna.
function Dia({ etiqueta, fechaGrande, lugar, direccion, fecha, hora, nota, mapsEmbed, mapsLink, fotos }) {
  const { t } = useI18n()
  return (
    <article className="dia">
      <div className={`dia__grid${mapsEmbed ? '' : ' dia__grid--sin-mapa'}`}>
        <div className="dia__info">
          <p className="dia__etiqueta">{etiqueta}</p>
          <h3 className="dia__fecha">{fechaGrande}</h3>
          <p className="dia__anio">2027</p>
          <h4 className="dia__lugar">{lugar}</h4>
          {direccion && <p className="dia__dato">{direccion}</p>}
          <p className="dia__dato">
            {fecha} · {hora}
          </p>
          {nota && <p className="dia__nota">{nota}</p>}
          {mapsLink && (
            <a className="dia__enlace" href={mapsLink} target="_blank" rel="noreferrer">
              {t('detalii.ventMapa')} ↗
            </a>
          )}
        </div>
        {mapsEmbed && (
          <div className="dia__mapa">
            <iframe src={mapsEmbed} title={lugar} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      </div>
      <Carrusel fotos={fotos} nombre={lugar} />
    </article>
  )
}

export default function Detalles() {
  const { t } = useI18n()

  return (
    <section className="seccion seccion--marfil" id="detalii">
      <Rasgado className="seccion__corte seccion__corte--oscuro" />
      <div className="seccion__inner">
        <Reveal>
          <p className="eyebrow">{t('detalii.eyebrow')}</p>
          <h2 className="titulo">{t('detalii.titlu')}</h2>
        </Reveal>
        <Reveal>
          <Dia
            etiqueta={t('detalii.ceremonie.eticheta')}
            fechaGrande={t('detalii.ceremonie.fechaGrande')}
            lugar={CEREMONIA.lugar}
            direccion={CEREMONIA.direccion}
            fecha={t('detalii.ceremonie.data')}
            hora={t('detalii.ceremonie.ora')}
            nota={!CEREMONIA.direccionConfirmada ? t('detalii.ceremonie.direccionNota') : null}
            mapsEmbed={CEREMONIA.mapsEmbed}
            mapsLink={CEREMONIA.mapsLink}
            fotos={FOTOS_CEREMONIA}
          />
        </Reveal>
        <div className="dia-conector" aria-hidden="true">
          <span className="dia-conector__linea" />
          <span className="dia-conector__punto" />
          <span className="dia-conector__linea" />
        </div>
        <Reveal>
          <Dia
            etiqueta={t('detalii.receptie.eticheta')}
            fechaGrande={t('detalii.receptie.fechaGrande')}
            lugar={RECEPCION.lugar}
            direccion={RECEPCION.direccion}
            fecha={t('detalii.receptie.data')}
            hora={t('detalii.receptie.ora')}
            mapsEmbed={RECEPCION.mapsEmbed}
            mapsLink={RECEPCION.mapsLink}
            fotos={FOTOS_RECEPCION}
          />
        </Reveal>
      </div>
    </section>
  )
}
