// Banderas como SVG inline: escalan con el contenedor y se recortan en
// círculo con overflow hidden. Compartidas entre el selector de idioma
// público (Idiomas.jsx) y la banderita del listado del panel admin.
export const BANDERAS = {
  ro: {
    nombre: 'Română',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1" height="2" fill="#002B7F" />
        <rect x="1" width="1" height="2" fill="#FCD116" />
        <rect x="2" width="1" height="2" fill="#CE1126" />
      </svg>
    ),
  },
  es: {
    nombre: 'Español',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="3" height="2" fill="#AA151B" />
        <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      </svg>
    ),
  },
  ru: {
    nombre: 'Русский',
    svg: (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="3" height="0.6667" fill="#FFFFFF" />
        <rect y="0.6667" width="3" height="0.6667" fill="#0039A6" />
        <rect y="1.3334" width="3" height="0.6666" fill="#D52B1E" />
      </svg>
    ),
  },
}
