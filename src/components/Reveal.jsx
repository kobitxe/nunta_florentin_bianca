import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Envuelve una sección y la hace aparecer con fade-in + desplazamiento
// al entrar en viewport, una sola vez.
export default function Reveal({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const nodo = ref.current

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(nodo, { opacity: 1, y: 0 })
      return
    }

    const tween = gsap.fromTo(
      nodo,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: nodo,
          start: 'top 85%',
          once: true,
        },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
