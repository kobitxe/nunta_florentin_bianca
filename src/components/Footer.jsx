import { useI18n } from '../i18n/context.js'
import { Rasgado, Rosas } from './Decor.jsx'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="footer">
      <Rasgado className="seccion__corte seccion__corte--papel" />
      <Rosas className="footer__rosas" />
      <p className="footer__frase">{t('footer.frase')}</p>
      <p className="footer__firma">{t('footer.firma')}</p>
    </footer>
  )
}
