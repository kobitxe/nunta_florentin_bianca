import GraficoBarras from './GraficoBarras.jsx'
import { estadoDe, primerRsvp } from './helpers.js'

export default function Inicio({ lista }) {
  const confirmadas = lista.filter((i) => estadoDe(i) === 'si')
  const noAsisten = lista.filter((i) => estadoDe(i) === 'no')
  const pendientes = lista.filter((i) => estadoDe(i) === 'pendiente')
  const conMisa = lista.filter((i) => i.variante === 'con_misa').length

  const stats = [
    { num: lista.length, label: 'Invitaciones' },
    { num: confirmadas.length, label: 'Han dicho sí' },
    { num: noAsisten.length, label: 'Han dicho no' },
    { num: pendientes.length, label: 'Faltan por confirmar' },
  ]

  // "Confirmados" separa adultos (pareja = 2, individual = 1) de niños
  // (num_ninos de cada respuesta), para planificar los menús.
  const adultosConfirmados = confirmadas.reduce((sum, i) => sum + (i.tipo === 'pareja' ? 2 : 1), 0)
  const ninosConfirmados = confirmadas.reduce((sum, i) => sum + (primerRsvp(i)?.num_ninos || 0), 0)
  const confirmados = [
    { num: adultosConfirmados, label: 'Adultos' },
    { num: ninosConfirmados, label: 'Niños' },
    { num: adultosConfirmados + ninosConfirmados, label: 'Total' },
  ]

  const porIdioma = { ro: 0, ru: 0, es: 0 }
  for (const inv of lista) {
    if (inv.idioma && inv.idioma in porIdioma) porIdioma[inv.idioma] += 1
  }

  if (lista.length === 0) {
    return (
      <div className="admin-seccion">
        <h2 className="admin-seccion__titulo">Resumen</h2>
        <p className="aviso aviso--info">
          Todavía no hay invitaciones. Ve a "Invitaciones" para crear la primera.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-seccion">
      <h2 className="admin-seccion__titulo">Resumen</h2>

      <div className="stats stats--admin">
        {stats.map((s) => (
          <div className="stats__celda" key={s.label}>
            <div className="stats__num">{s.num}</div>
            <div className="stats__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-grafico-card admin-confirmados">
        <h3>Confirmados</h3>
        <div className="stats stats--confirmados">
          {confirmados.map((s) => (
            <div className="stats__celda" key={s.label}>
              <div className="stats__num">{s.num}</div>
              <div className="stats__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-graficos">
        <div className="admin-grafico-card">
          <h3>Respuestas</h3>
          <GraficoBarras
            filas={[
              { clave: 'si', etiqueta: 'Sí', valor: confirmadas.length, color: 'var(--salvia-oscura)' },
              { clave: 'no', etiqueta: 'No', valor: noAsisten.length, color: 'var(--estado-no)' },
              { clave: 'pendiente', etiqueta: 'Pendiente', valor: pendientes.length, color: 'var(--taupe)' },
            ]}
          />
        </div>

        <div className="admin-grafico-card">
          <h3>Tipo de invitación</h3>
          <GraficoBarras
            filas={[
              { clave: 'sin_misa', etiqueta: 'Sin Misa', valor: lista.length - conMisa, color: 'var(--salvia)' },
              { clave: 'con_misa', etiqueta: 'Con Misa', valor: conMisa, color: 'var(--salvia)' },
            ]}
          />
        </div>

        <div className="admin-grafico-card">
          <h3>Idioma</h3>
          <GraficoBarras
            filas={[
              { clave: 'ro', etiqueta: 'Rumano', valor: porIdioma.ro, color: 'var(--salvia)' },
              { clave: 'ru', etiqueta: 'Ruso', valor: porIdioma.ru, color: 'var(--salvia)' },
              { clave: 'es', etiqueta: 'Español', valor: porIdioma.es, color: 'var(--salvia)' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
