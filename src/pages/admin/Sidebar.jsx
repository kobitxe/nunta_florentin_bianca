import { useEffect, useState } from 'react'

const SECCIONES = [
  { id: 'inicio', etiqueta: 'Inicio' },
  { id: 'invitaciones', etiqueta: 'Invitaciones' },
  { id: 'respuestas', etiqueta: 'Respuestas' },
]

// Navegación del panel: barra lateral fija en escritorio; en móvil/tablet
// se sustituye por una barra superior con menú hamburguesa que abre un
// panel deslizante (drawer) desde la izquierda, con overlay.
export default function Sidebar({ seccion, onCambiarSeccion, email, onCerrarSesion }) {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!abierto) return
    const onTecla = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', onTecla)
    return () => document.removeEventListener('keydown', onTecla)
  }, [abierto])

  const irA = (id) => {
    onCambiarSeccion(id)
    setAbierto(false)
  }

  return (
    <>
      <header className="admin-topbar">
        <button
          className="admin-hamburguesa"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(true)}
        >
          <span />
          <span />
          <span />
        </button>
        <span className="admin-topbar__marca">Panel de la boda</span>
      </header>

      <nav className="admin-sidebar" aria-label="Secciones del panel">
        <div className="admin-sidebar__marca">Panel de la boda</div>
        <ul className="admin-sidebar__lista">
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`admin-sidebar__btn${seccion === s.id ? ' activo' : ''}`}
                aria-current={seccion === s.id ? 'page' : undefined}
                onClick={() => onCambiarSeccion(s.id)}
              >
                {s.etiqueta}
              </button>
            </li>
          ))}
        </ul>
        <div className="admin-sidebar__pie">
          <span className="tabla__detalle">{email}</span>
          <button className="btn-mini" type="button" onClick={onCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div
        className={`admin-drawer__fondo${abierto ? ' abierto' : ''}`}
        onClick={() => setAbierto(false)}
        aria-hidden="true"
      />
      <nav className={`admin-drawer${abierto ? ' abierto' : ''}`} aria-label="Secciones del panel">
        <div className="admin-sidebar__marca">Panel de la boda</div>
        <ul className="admin-sidebar__lista">
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`admin-sidebar__btn${seccion === s.id ? ' activo' : ''}`}
                aria-current={seccion === s.id ? 'page' : undefined}
                onClick={() => irA(s.id)}
              >
                {s.etiqueta}
              </button>
            </li>
          ))}
        </ul>
        <div className="admin-sidebar__pie">
          <span className="tabla__detalle">{email}</span>
          <button className="btn-mini" type="button" onClick={onCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </nav>
    </>
  )
}
