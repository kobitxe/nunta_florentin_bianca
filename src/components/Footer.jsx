import { useI18n } from '../i18n/context.js'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="footer">
      <p className="footer__frase">{t('footer.frase')}</p>
      <p className="footer__firma">{t('footer.firma')}</p>
    </footer>
  )
}
