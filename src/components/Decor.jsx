// Decoración del nuevo estilo: rosas blancas estilo acuarela y bordes
// de papel rasgado entre secciones. El color del rasgado se hereda de
// currentColor, así cada sección pinta el borde con el fondo contiguo.

const PETALO = 'M0,-30 C15,-27 21,-12 15,2 C10,14 -10,14 -15,2 C-21,-12 -15,-27 0,-30 Z'

function Rosa({ x, y, escala = 1, giro = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala}) rotate(${giro})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path
          key={a}
          d={PETALO}
          transform={`rotate(${a})`}
          fill={a % 120 === 0 ? '#fffdf6' : '#f3eee0'}
          stroke="#d6cfba"
          strokeWidth="1.2"
        />
      ))}
      {[30, 90, 150, 210, 270, 330].map((a) => (
        <path
          key={a}
          d={PETALO}
          transform={`rotate(${a}) scale(0.62)`}
          fill={a % 90 === 0 ? '#f7f2e5' : '#fffef8'}
          stroke="#d6cfba"
          strokeWidth="1.4"
        />
      ))}
      <circle r="9" fill="#ece5d2" stroke="#cfc7b0" strokeWidth="1" />
      <path d="M-5,1 A5.5 5.5 0 1 1 5,2 A4 4 0 1 0 -2,-3" fill="none" stroke="#b9b096" strokeWidth="1.4" />
    </g>
  )
}

function Hoja({ x, y, giro = 0, escala = 1, tono = '#93a37e' }) {
  return (
    <path
      d="M0,0 Q14,-16 34,-14 Q30,8 8,10 Q2,6 0,0 Z"
      transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}
      fill={tono}
      opacity="0.85"
    />
  )
}

export function Rosas({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 230 160" aria-hidden="true">
      <Hoja x={28} y={96} giro={150} escala={1.3} />
      <Hoja x={70} y={132} giro={100} escala={1.1} tono="#aab792" />
      <Hoja x={150} y={38} giro={-40} escala={1.2} />
      <Hoja x={190} y={80} giro={20} escala={1} tono="#aab792" />
      <Hoja x={120} y={120} giro={60} escala={0.9} tono="#c2cbaf" />
      <Rosa x={88} y={80} escala={1.15} giro={12} />
      <Rosa x={172} y={52} escala={0.68} giro={-25} />
      <Rosa x={45} y={48} escala={0.45} giro={40} />
    </svg>
  )
}

export function Rasgado({ className = '' }) {
  return (
    <svg className={`rasgado ${className}`} viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0,44 C60,30 120,56 190,44 C260,32 320,58 390,46 C460,34 520,60 600,46 C680,32 740,56 810,44 C880,32 950,58 1020,46 C1090,34 1150,54 1200,42 L1200,0 L0,0 Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M0,32 C70,20 130,46 200,34 C270,22 340,48 410,36 C480,24 550,50 620,36 C690,22 760,46 830,34 C900,22 970,48 1040,36 C1110,24 1160,44 1200,32 L1200,0 L0,0 Z"
        fill="currentColor"
      />
    </svg>
  )
}
