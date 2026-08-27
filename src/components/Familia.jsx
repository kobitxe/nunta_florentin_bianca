import { useI18n } from '../i18n/context.js'
import Reveal from './Reveal.jsx'
import { Rasgado } from './Decor.jsx'
import Paloma from './Paloma.jsx'

// Padres y nași (padrinos): la bendición que acompaña a los novios.
// La paloma junto a un nombre marca a quien ya no está con nosotros.
export default function Familia() {
  const { t } = useI18n()

  return (
    <section className="seccion seccion--marfil familia">
      <Rasgado className="seccion__corte seccion__corte--papel" />
      <div className="seccion__inner">
        <Reveal>
          <p className="familia__cita">{t('familia.citaParinti')}</p>
          <div className="familia__parejas">
            <p className="familia__pareja">Livia &amp; Danuț Larie</p>
            <p className="familia__pareja">
              Paula Izot &amp; Ignat Abaianitz 🕊️{' '}
              <span
                className="familia__memoria"
                role="img"
                aria-label={`${t('familia.memoria')} Ignat`}
                title={`${t('familia.memoria')} Ignat`}
              >
                
                <Paloma />
              </span>
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="familia__divisor" aria-hidden="true" />
          <p className="familia__cita">{t('familia.citaNasi')}</p>
          <p className="familia__eticheta">{t('familia.nasiEticheta')}</p>
          <p className="familia__pareja">Nina &amp; Alexandru Ahtamon</p>
        </Reveal>
      </div>
    </section>
  )
}
