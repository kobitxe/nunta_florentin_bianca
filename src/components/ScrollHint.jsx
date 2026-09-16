import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { LuPointer } from 'react-icons/lu'

// Pista de scroll: el mismo icono de mano que ya usa el sobre para
// "toca para abrir", pero aquí haciendo el gesto completo de deslizar
// — aparece, presiona, arrastra hacia abajo y se desvanece — para que
// se entienda a la primera sin necesidad de flechas ni de la palabra
// "desliza". Aparece cuando la carta ya se ha abierto y el Hero está a
// la vista, se apaga en cuanto el invitado hace scroll de verdad, y
// vuelve a encenderse cada vez que el Hero reaparece (p. ej. si sube
// arriba otra vez).
const UMBRAL_SCROLL = 40

export default function ScrollHint() {
  const cajaRef = useRef(null)
  const manoRef = useRef(null)

  useEffect(() => {
    const caja = cajaRef.current
    const mano = manoRef.current
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let mostrada = false
    let gesto = null

    // Estado de partida: invisible. (La hoja de estilos ya arranca en
    // opacity:0; se fija aquí también por si el efecto corriera después
    // de que algo hubiera tocado esos valores.)
    gsap.set(caja, { opacity: 0, y: 10 })
    gsap.set(mano, { y: -16, opacity: 0, scale: 0.9 })

    const mostrar = () => {
      if (mostrada) return
      mostrada = true

      if (reducido) {
        gsap.set(caja, { opacity: 1, y: 0 })
        gsap.set(mano, { y: 0, opacity: 1, scale: 1 })
        return
      }

      gsap.killTweensOf(caja)
      gsap.fromTo(caja, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })

      // El gesto completo en un único trayecto: nace arriba (invisible),
      // presiona (se achata un poco), arrastra hacia abajo, suelta
      // (rebote leve al soltar) y se desvanece antes de terminar.
      // Empieza y termina en opacidad 0, así que el bucle no da ningún
      // salto al repetirse.
      gsap.set(mano, { y: -16, opacity: 0, scale: 0.9 })
      gesto = gsap.to(mano, {
        keyframes: {
          '0%': { y: -16, opacity: 0, scale: 0.9 },
          '14%': { opacity: 1, scale: 1 },
          '24%': { scale: 0.85 },
          '78%': { y: 24, scale: 0.9, opacity: 1 },
          '90%': { scale: 1.06 },
          '100%': { y: 32, opacity: 0, scale: 0.98 },
        },
        duration: 1.5,
        ease: 'power1.inOut',
        repeat: -1,
        repeatDelay: 0.6,
      })
    }

    const ocultar = () => {
      if (!mostrada) return
      mostrada = false

      // Solo se para el bucle (el gesto se congela donde esté en ese
      // instante); la desaparición en sí la hace, sola, el fundido de
      // la caja de fuera, de opacidad 1 a 0.
      gesto?.kill()
      gesto = null

      if (reducido) {
        gsap.set(caja, { opacity: 0 })
        return
      }
      gsap.killTweensOf(caja)
      gsap.to(caja, { opacity: 0, y: 10, duration: 0.5, ease: 'sine.inOut' })
    }

    const alHacerScroll = () => {
      if (window.scrollY > UMBRAL_SCROLL) ocultar()
      else mostrar()
    }

    // Entrada inicial: algo de aire para que el Hero se lea antes de
    // reclamar atención abajo (solo si, para entonces, seguimos arriba
    // del todo: si el invitado ya hizo scroll, no tiene sentido que
    // aparezca solo para desaparecer al instante).
    const idInicial = window.setTimeout(() => {
      if (window.scrollY <= UMBRAL_SCROLL) mostrar()
    }, 800)

    window.addEventListener('scroll', alHacerScroll, { passive: true })

    return () => {
      window.clearTimeout(idInicial)
      window.removeEventListener('scroll', alHacerScroll)
      gesto?.kill()
      gsap.killTweensOf([caja, mano])
    }
  }, [])

  return (
    <div className="arrastre-hint" ref={cajaRef} aria-hidden="true">
      <div className="arrastre-hint__grupo">
        <span className="arrastre-hint__mano" ref={manoRef}>
          <LuPointer />
        </span>
      </div>
    </div>
  )
}
