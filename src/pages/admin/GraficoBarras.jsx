// Lista de barras horizontales simples (tipo "meter"): cada fila ya lleva
// su propia etiqueta de texto, así que el color no necesita distinguir
// categorías — solo se usa para dar significado (p. ej. sí/no/pendiente).
// Sin ejes ni leyenda: para 2-3 filas etiquetadas es más claro así.
export default function GraficoBarras({ filas }) {
  const max = Math.max(1, ...filas.map((f) => f.valor))
  const resumen = filas.map((f) => `${f.etiqueta}: ${f.valor}`).join(', ')

  return (
    <div className="grafico-barras" role="img" aria-label={resumen}>
      {filas.map((f) => (
        <div className="grafico-barras__fila" key={f.clave}>
          <span className="grafico-barras__etiqueta">{f.etiqueta}</span>
          <span className="grafico-barras__pista">
            <span
              className="grafico-barras__barra"
              style={{ width: `${(f.valor / max) * 100}%`, background: f.color }}
            />
          </span>
          <span className="grafico-barras__valor">{f.valor}</span>
        </div>
      ))}
    </div>
  )
}
