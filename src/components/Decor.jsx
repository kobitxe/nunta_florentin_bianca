// Decoración: esquina de rosas blancas (public/rosas.png, orientada a la
// esquina inferior izquierda; se voltea con CSS según dónde se coloque) y
// bordes de papel rasgado entre secciones. El color del rasgado se hereda
// de currentColor, así cada sección pinta el borde con el fondo contiguo.

export function Rosas({ className = '' }) {
  return <img className={className} src="/rosas.png" alt="" aria-hidden="true" loading="lazy" />
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
