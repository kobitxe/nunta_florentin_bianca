// Datos reales de la boda. Un único punto de verdad para fechas y lugares.
// La misa del 5 de agosto en Brăila tendrá su propia invitación aparte
// (en ruso/rumano); esta invitación cubre solo el día del 8 de agosto.

export const CEREMONIA = {
  fechaISO: '2027-08-08T16:00:00+03:00',
  horaConfirmada: true,
  // Dirección aún pendiente: Bianca la pasará más adelante.
  direccionConfirmada: false,
  lugar: 'Biserica Neagră',
  direccion: null,
  mapsLink: null,
}

export const RECEPCION = {
  fechaISO: '2027-08-08T17:00:00+03:00',
  lugar: 'Restaurant Terasa Tic Tac Mamaia',
  direccion: 'Bulevardul Mamaia, Constanța',
  mapsLink: 'https://maps.app.goo.gl/jKUJbrnZ2ZwZRFZR7',
}

// Teléfonos de contacto por si falla el formulario de RSVP.
export const CONTACTO = {
  bianca: { nombre: 'Bianca', numero: '642 98 83 79', tel: '+34642988379' },
  florentin: { nombre: 'Florentin', numero: '697 64 20 44', tel: '+34697642044' },
}

// Fotos de la galería: Bianca pasará las definitivas.
// Admite URLs externas o públicas de Supabase Storage.
export const GALERIA_FOTOS = []

// Foto del sitio para la sección Detalles.
export const FOTO_CEREMONIA = '/misa.jpeg'
export const FOTO_RECEPCION = '/tictac.jpeg'
