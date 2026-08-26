const SECCIONES = [
  { id: 'inicio', etiqueta: 'Inicio' },
  { id: 'invitaciones', etiqueta: 'Invitaciones' },
  { id: 'respuestas', etiqueta: 'Respuestas' },
]

// Navegación del panel: barra lateral fija en escritorio, barra superior
// (marca + cerrar sesión) y barra inferior de pestañas en móvil — pensada
// para usarse con el pulgar en vez de un menú hamburguesa.
export default function Sidebar({ seccion, onCambiarSeccion, email, onCerrarSesion }) {
  return (
    <>
      <header className="admin-topbar">
        <span className="admin-topbar__marca">Panel de la boda</span>
        <button className="btn-mini" type="button" onClick={onCerrarSesion}>
          Salir
        </button>
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

      <nav className="admin-tabbar" aria-label="Secciones del panel">
        {SECCIONES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`admin-tabbar__btn${seccion === s.id ? ' activo' : ''}`}
            aria-current={seccion === s.id ? 'page' : undefined}
            onClick={() => onCambiarSeccion(s.id)}
          >
            {s.etiqueta}
          </button>
        ))}
      </nav>
    </>
  )
}
