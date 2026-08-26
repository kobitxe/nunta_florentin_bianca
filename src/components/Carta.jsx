import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { LuPointer } from 'react-icons/lu'
import { useI18n } from '../i18n/context.js'
import { nombresDe, nombreDesdeToken } from '../lib/nombres.js'

// Sobre de entrada: cubre la pantalla hasta que el invitado lo abre
// con un click o con el primer intento de scroll. La apertura es un
// timeline de GSAP: sello → solapa → interior → desvanecido del overlay.
export default function Carta({ invitado, token, denegado }) {
  const { t } = useI18n()
  const [fase, setFase] = useState('cerrada') // cerrada | abriendo | oculta
  const [avisoVisible, setAvisoVisible] = useState(true)
  const cartaRef = useRef(null)
  const solapaRef = useRef(null)
  const selloRef = useRef(null)
  const interiorRef = useRef(null)
  const hintRef = useRef(null)

  // Sin invitación válida, el sobre se queda cerrado para siempre: no
  // reacciona a clics ni a gestos de scroll/teclado.
  const abrir = useCallback(() => {
    if (denegado) return
    setFase((f) => (f === 'cerrada' ? 'abriendo' : f))
  }, [denegado])

  useEffect(() => {
    if (fase !== 'abriendo') return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFase('oculta')
      return
    }

    gsap.set(interiorRef.current, { opacity: 0.35 })

    const tl = gsap.timeline({ onComplete: () => setFase('oculta') })
    tl.to(hintRef.current, { opacity: 0, y: 8, duration: 0.25, ease: 'power2.in' }, 0)
      .to(selloRef.current, { scale: 0.85, duration: 0.12, ease: 'power2.in' }, 0)
      .to(selloRef.current, { scale: 0, opacity: 0, rotate: 20, duration: 0.35, ease: 'back.in(1.6)' }, 0.12)
      .to(solapaRef.current, { rotationX: 180, duration: 0.85, ease: 'power3.inOut' }, 0.1)
      .to(interiorRef.current, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.25)
      // Los nombres se quedan un momento en pantalla, totalmente opacos,
      // para dar tiempo a leerlos antes de que empiece el desvanecido.
      .to(interiorRef.current, { opacity: 1, duration: 0.55 }, 0.95)
      // El texto interior se desvanece antes que el resto del sobre, para
      // que no quede a medio camino superpuesto (y por tanto ilegible)
      // con el texto del Hero mientras el sobre entero pierde opacidad.
      .to(interiorRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.5)
      .to(cartaRef.current, { opacity: 0, scale: 1.04, duration: 0.65, ease: 'power2.out' }, 1.55)

    return () => tl.kill()
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
    if (fase !== 'cerrada' || denegado) return
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
  }, [fase, denegado, abrir])

  if (fase === 'oculta') return null

  const nombreDestinatario = denegado ? null : invitado ? nombresDe(invitado) : nombreDesdeToken(token)

  return (
    <div
      ref={cartaRef}
      className={`carta${fase === 'abriendo' ? ' carta--abierta' : ''}${denegado ? ' carta--bloqueada' : ''}`}
    >
      <button
        type="button"
        className="sobre"
        onClick={abrir}
        disabled={denegado}
        aria-label={denegado ? t('carta.bloqueadaTexto') : t('carta.abrir')}
      >
        <span className="sobre__interior" ref={interiorRef}>
          <span className="sobre__interior-nombres">Bianca &amp; Florentin</span>
          <span className="sobre__interior-fecha">{t('hero.datele')}</span>
        </span>
        <span className="sobre__ala sobre__ala--izq" />
        <span className="sobre__ala sobre__ala--der" />
        <span className="sobre__ala sobre__ala--inf" />
        <span className="sobre__solapa" ref={solapaRef} />
        {nombreDestinatario && (
          <span className="sobre__destinatario">
            {t('carta.para')} {nombreDestinatario}
          </span>
        )}
        <span className="sobre__sello" ref={selloRef}>
          B&amp;F
        </span>
        {!denegado && (
          <span className="carta__hint" ref={hintRef}>
            <LuPointer className="carta__hint-dedo" aria-hidden="true" />
            <span className="carta__hint-texto">{t('carta.ajutor')}</span>
          </span>
        )}
      </button>

      {denegado && avisoVisible && (
        <div className="modal" onClick={() => setAvisoVisible(false)}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            <p>{t('carta.bloqueadaTexto')}</p>
            <button className="rsvp__enviar" type="button" onClick={() => setAvisoVisible(false)}>
              {t('carta.bloqueadaBoton')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
