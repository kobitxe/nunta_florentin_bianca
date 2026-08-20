import { useEffect, useRef } from 'react'

// Envuelve una sección y la hace aparecer con fade-in al entrar en viewport.
export default function Reveal({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const nodo = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          nodo.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(nodo)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
