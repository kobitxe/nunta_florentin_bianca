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
  mapsEmbed: null,
}

export const RECEPCION = {
  fechaISO: '2027-08-08T17:00:00+03:00',
  lugar: 'Restaurant Terasa Tic Tac Mamaia',
  direccion: 'Bulevardul Mamaia, Constanța',
  mapsLink: 'https://maps.app.goo.gl/jKUJbrnZ2ZwZRFZR7',
  mapsEmbed:
    'https://www.google.com/maps?q=Restaurant+Terasa+Tic+Tac+Mamaia,+Bulevardul+Mamaia,+Constan%C8%9Ba&output=embed',
}

// Teléfonos de contacto por si falla el formulario de RSVP.
export const CONTACTO = {
  bianca: { nombre: 'Bianca', numero: '642 98 83 79', tel: '+34642988379' },
  florentin: { nombre: 'Florentin', numero: '697 64 20 44', tel: '+34697642044' },
}

// Fotos de la galería: Bianca pasará las definitivas.
// Admite URLs externas o públicas de Supabase Storage.
export const GALERIA_FOTOS = []

// Fotos de los sitios para los carruseles de la sección Detalles.
// FOTOS_CEREMONIA son provisionales (de la iglesia de Brăila, no de
// Biserica Neagră); Bianca las sustituirá cuando tenga las nuevas.
export const FOTOS_CEREMONIA = ['/iglesia-1.jpg', '/iglesia-2.jpg', '/iglesia-3.jpg', '/iglesia-4.jpg']
export const FOTOS_RECEPCION = ['/tictac-1.jpg', '/tictac-2.jpg', '/tictac-3.jpg', '/tictac-4.jpg']
