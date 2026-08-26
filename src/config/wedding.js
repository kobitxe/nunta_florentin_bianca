// Datos reales de la boda. Un único punto de verdad para fechas y lugares.
// La invitación "con misa" (variante/idioma en la tabla invitados) añade
// la tarjeta de la cununia religioasă del 5 de agosto; la invitación base
// ("sin misa") solo muestra el día 8 de agosto.

export const CEREMONIA = {
  fechaISO: '2027-08-05T11:00:00+03:00',
  horaConfirmada: true,
  direccionConfirmada: true,
  lugar: 'Biserica Ortodoxă de Rit Vechi «Vovidenia»',
  direccion: 'Strada Reșița 76, Brăila',
  mapsLink: 'https://maps.app.goo.gl/TZY2cbGt27xjeFCRA?g_st=iw',
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
