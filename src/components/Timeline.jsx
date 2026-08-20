import { useI18n } from '../i18n/context.js'
import Reveal from './Reveal.jsx'

function Dia({ titulo, eventos }) {
  return (
    <div className="timeline__dia">
      <h3>{titulo}</h3>
      <ul className="timeline__lista">
        {eventos.map((ev) => (
          <li className="timeline__item" key={`${ev.ora}-${ev.text}`}>
            <div className="timeline__hora">{ev.ora}</div>
            <div className="timeline__texto">{ev.text}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Timeline() {
  const { t } = useI18n()

  return (
    <section className="seccion" id="program">
      <div className="seccion__inner">
        <Reveal>
          <p className="eyebrow">{t('program.eyebrow')}</p>
          <h2 className="titulo">{t('program.titlu')}</h2>
        </Reveal>
        <Reveal>
          <div className="timeline">
            <Dia titulo={t('program.zi1')} eventos={t('program.evenimente1')} />
            <Dia titulo={t('program.zi2')} eventos={t('program.evenimente2')} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
