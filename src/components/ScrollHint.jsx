import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { LuChevronDown } from 'react-icons/lu'

// Pista de scroll: tres flechas que caen en ola bajo el Hero para que
// se entienda que la invitación continúa hacia abajo. Aparece solo
// cuando la carta ya se ha abierto y desaparece en cuanto el invitado
// hace scroll de verdad: cumplida su función, ya no vuelve.
const UMBRAL_SCROLL = 40

export default function ScrollHint() {
  const [visible, setVisible] = useState(true)
  const cajaRef = useRef(null)
  const grupoRef = useRef(null)

  useEffect(() => {
    const caja = cajaRef.current
    const grupo = grupoRef.current
    const flechas = grupo.children
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const animaciones = []

    if (reducido) {
      gsap.set(caja, { opacity: 1, y: 0 })
      gsap.set(flechas, { opacity: 1, y: 0 })
    } else {
      // Entrada retardada: el sobre acaba de desvanecerse y conviene que
      // el Hero se lea un segundo antes de reclamar atención abajo.
      animaciones.push(
        gsap.fromTo(
          caja,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, delay: 1, ease: 'power2.out' },
        ),
      )

      // Bamboleo del grupo entero: va en el nodo interior para no chocar
      // con el fundido de entrada/salida, que anima la caja de fuera.
      animaciones.push(
        gsap.to(grupo, { y: 7, duration: 1.15, ease: 'sine.inOut', repeat: -1, yoyo: true }),
      )

      // La ola: las tres flechas se encienden y caen escalonadas, de
      // arriba abajo, dibujando el gesto de deslizar.
      const ola = gsap.timeline({ repeat: -1, repeatDelay: 0.45, delay: 1 })
      ola
        .fromTo(
          flechas,
          { opacity: 0.1, y: -6 },
          { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', stagger: 0.16 },
          0,
        )
        .to(flechas, { opacity: 0.1, y: 6, duration: 0.42, ease: 'power2.in', stagger: 0.16 }, 0.5)
      animaciones.push(ola)
    }

    const alHacerScroll = () => {
      if (window.scrollY <= UMBRAL_SCROLL) return
      window.removeEventListener('scroll', alHacerScroll)
      if (reducido) {
        setVisible(false)
        return
      }
      animaciones.forEach((a) => a.kill())
      gsap.to(caja, {
        opacity: 0,
        y: 16,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => setVisible(false),
      })
    }
    window.addEventListener('scroll', alHacerScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', alHacerScroll)
      animaciones.forEach((a) => a.kill())
      gsap.killTweensOf(caja)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="scroll-hint" ref={cajaRef} aria-hidden="true">
      <div className="scroll-hint__flechas" ref={grupoRef}>
        <LuChevronDown className="scroll-hint__flecha" />
        <LuChevronDown className="scroll-hint__flecha" />
        <LuChevronDown className="scroll-hint__flecha" />
      </div>
    </div>
  )
}
