import { useI18n } from '../i18n/context.js'
import { CEREMONIA, RECEPCION, FOTO_CEREMONIA, FOTO_RECEPCION } from '../config/wedding.js'
import Reveal from './Reveal.jsx'
import { Rasgado } from './Decor.jsx'

// Banda horizontal de un día: fecha grande, datos y foto del sitio.
// El mapa se muestra como un botón que abre Google Maps, no como iframe.
function Dia({ etiqueta, fechaGrande, lugar, direccion, fecha, hora, nota, mapsLink, foto }) {
  const { t } = useI18n()
  return (
    <article className="dia">
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
          <a className="dia__boton-mapa" href={mapsLink} target="_blank" rel="noreferrer">
            {t('detalii.ventMapa')}
          </a>
        )}
      </div>
      <div className="dia__foto">
        <p className="dia__foto-titulo">{lugar}</p>
        <div className="dia__foto-marco">
          <img src={foto} alt={lugar} loading="lazy" />
        </div>
      </div>
    </article>
  )
}

export default function Detalles({ invitado }) {
  const { t } = useI18n()
  const conMisa = invitado?.variante === 'con_misa'

  return (
    <section className="seccion seccion--marfil" id="detalii">
      <Rasgado className="seccion__corte seccion__corte--oscuro" />
      <div className="seccion__inner">
        <Reveal>
          <p className="eyebrow">{t('detalii.eyebrow')}</p>
          <h2 className="titulo">{t('detalii.titlu')}</h2>
        </Reveal>

        {conMisa && (
          <Reveal>
            <Dia
              etiqueta={t('detalii.ceremonie.eticheta')}
              fechaGrande={t('detalii.ceremonie.fechaGrande')}
              lugar={CEREMONIA.lugar}
              direccion={CEREMONIA.direccion}
              fecha={t('detalii.ceremonie.data')}
              hora={t('detalii.ceremonie.ora')}
              mapsLink={CEREMONIA.mapsLink}
              foto={FOTO_CEREMONIA}
            />
          </Reveal>
        )}

        <Reveal>
          <Dia
            etiqueta={t('detalii.receptie.eticheta')}
            fechaGrande={t('detalii.receptie.fechaGrande')}
            lugar={RECEPCION.lugar}
            direccion={RECEPCION.direccion}
            fecha={t('detalii.receptie.data')}
            hora={t('detalii.receptie.ora')}
            mapsLink={RECEPCION.mapsLink}
            foto={FOTO_RECEPCION}
          />
        </Reveal>
      </div>
    </section>
  )
}
