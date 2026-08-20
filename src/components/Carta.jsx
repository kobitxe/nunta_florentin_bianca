import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context.js'

const DURACION_APERTURA = 1800

// Sobre de entrada: cubre la pantalla hasta que el invitado lo abre
// con un click o con el primer intento de scroll.
export default function Carta() {
  const { t } = useI18n()
  const [fase, setFase] = useState('cerrada') // cerrada | abriendo | oculta

  const abrir = () => setFase((f) => (f === 'cerrada' ? 'abriendo' : f))

  useEffect(() => {
    if (fase !== 'abriendo') return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(() => setFase('oculta'), reducido ? 0 : DURACION_APERTURA)
    return () => clearTimeout(timer)
  }, [fase])

  // Sin scroll de fondo mientras la carta siga en pantalla.
  useEffect(() => {
    if (fase === 'oculta') return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [fase])

  // El primer gesto de scroll también abre la carta.
  useEffect(() => {
    if (fase !== 'cerrada') return
    const onGesto = () => abrir()
    const onTecla = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) abrir()
    }
    window.addEventListener('wheel', onGesto, { passive: true })
    window.addEventListener('touchmove', onGesto, { passive: true })
    window.addEventListener('keydown', onTecla)
    return () => {
      window.removeEventListener('wheel', onGesto)
      window.removeEventListener('touchmove', onGesto)
      window.removeEventListener('keydown', onTecla)
    }
  }, [fase])

  if (fase === 'oculta') return null

  return (
    <div className={`carta${fase === 'abriendo' ? ' carta--abierta' : ''}`}>
      <button type="button" className="sobre" onClick={abrir} aria-label={t('carta.abrir')}>
        <span className="sobre__papel">
          <span className="sobre__papel-nombres">Flo &amp; Bianca</span>
          <span className="sobre__papel-fecha">{t('hero.datele')}</span>
        </span>
        <span className="sobre__pocket" />
        <span className="sobre__nombres">Flo &amp; Bianca</span>
        <span className="sobre__solapa" />
        <span className="sobre__sello">F&amp;B</span>
      </button>
      <p className="carta__hint">{t('carta.abrir')}</p>
    </div>
  )
}
