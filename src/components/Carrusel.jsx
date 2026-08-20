import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/context.js'

// Carrusel de fotos con scroll lateral infinito: las fotos se triplican
// y, al acercarse al principio o al final, el scroll salta un periodo
// exacto (ancho de una copia), de forma imperceptible.
export default function Carrusel({ fotos, nombre }) {
  const { t } = useI18n()
  const ref = useRef(null)

  useEffect(() => {
    const cont = ref.current
    if (!cont || fotos.length < 2) return

    const periodo = () => cont.children[fotos.length].offsetLeft - cont.children[0].offsetLeft

    cont.scrollLeft = periodo()

    const onScroll = () => {
      const per = periodo()
      if (per <= 0) return
      if (cont.scrollLeft < per * 0.5) cont.scrollLeft += per
      else if (cont.scrollLeft >= per * 1.5) cont.scrollLeft -= per
    }
    cont.addEventListener('scroll', onScroll, { passive: true })
    return () => cont.removeEventListener('scroll', onScroll)
  }, [fotos])

  if (fotos.length === 0) {
    return <div className="carrusel carrusel--vacio">{t('detalii.fotosPronto')}</div>
  }

  const triple = fotos.length > 1 ? [...fotos, ...fotos, ...fotos] : fotos

  return (
    <div className="carrusel-wrap">
      <div className="carrusel" ref={ref}>
        {triple.map((url, i) => (
          <img key={i} src={url} alt={`${nombre} ${(i % fotos.length) + 1}`} loading="lazy" />
        ))}
      </div>
      <p className="carrusel__hint" aria-hidden="true">
        ← {t('detalii.desliza')} →
      </p>
    </div>
  )
}
