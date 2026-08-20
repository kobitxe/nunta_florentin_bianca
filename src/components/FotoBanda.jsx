import { useI18n } from '../i18n/context.js'
import { Rasgado } from './Decor.jsx'

// Foto a sangre completa entre secciones, con bordes de papel rasgado.
export default function FotoBanda() {
  const { t } = useI18n()

  return (
    <section className="banda" aria-label={t('banda.texto')}>
      <img className="banda__img" src="/misa.jpeg" alt="" loading="lazy" />
      <div className="banda__velo" />
      <Rasgado className="banda__rasgado banda__rasgado--top" />
      <Rasgado className="banda__rasgado banda__rasgado--bottom" />
      <p className="banda__texto">{t('banda.texto')}</p>
    </section>
  )
}
