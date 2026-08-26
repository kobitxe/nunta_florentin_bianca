import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Detallito en memoria de Ignat: al entrar en viewport, una paloma
// pequeñita sale volando desde detrás de su nombre y se va desvaneciendo
// según se aleja. Un solo vuelo, no se repite.
export default function Paloma() {
  const ref = useRef(null)

  useEffect(() => {
    const nodo = ref.current
    if (!nodo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.set(nodo, { opacity: 0, x: 0, y: 0, scale: 0.85, rotate: -4 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: nodo, start: 'top 85%', once: true },
    })
      .to(nodo, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 0)
      .to(
        nodo,
        { x: '2.6em', y: '-2.2em', rotate: 6, scale: 1, duration: 1.7, ease: 'power1.out' },
        0,
      )
      .to(nodo, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 1.1)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <span className="paloma-vuelo" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 40 20" width="1em" height="0.5em">
        <path
          d="M20 12 C14 2 4 2 0 8 C6 8 12 10 16 14 L20 18 L24 14 C28 10 34 8 40 8 C36 2 26 2 20 12 Z"
          fill="#ffffff"
          stroke="var(--taupe)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
