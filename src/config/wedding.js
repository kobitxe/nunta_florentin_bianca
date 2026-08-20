// Datos reales de la boda. Un único punto de verdad para fechas y lugares.

export const CEREMONIA = {
  // Hora provisional (~11:00), pendiente de confirmación de los novios.
  fechaISO: '2027-08-05T11:00:00+03:00',
  horaConfirmada: false,
  lugar: 'Biserica Ortodoxă de Rit Vechi „Vovidenia”',
  direccion: 'Strada Reșița 76, Brăila',
  mapsLink: 'https://maps.app.goo.gl/TZY2cbGt27xjeFCRA',
  mapsEmbed:
    'https://www.google.com/maps?q=Biserica+Ortodox%C4%83+de+Rit+Vechi+%E2%80%9EVovidenia%E2%80%9D,+Strada+Re%C8%99i%C8%9Ba+76,+Br%C4%83ila&output=embed',
}

export const RECEPCION = {
  fechaISO: '2027-08-08T17:00:00+03:00',
  lugar: 'Restaurant Terasa Tic Tac Mamaia',
  direccion: 'Bulevardul Mamaia, Constanța',
  mapsLink: 'https://maps.app.goo.gl/jKUJbrnZ2ZwZRFZR7',
  mapsEmbed:
    'https://www.google.com/maps?q=Restaurant+Terasa+Tic+Tac+Mamaia,+Bulevardul+Mamaia,+Constan%C8%9Ba&output=embed',
}

// Fotos de la galería: Bianca pasará las definitivas.
// Admite URLs externas o públicas de Supabase Storage.
export const GALERIA_FOTOS = []

// Fotos de los sitios para los carruseles de la sección Detalles
// (iglesia de Brăila y restaurante de Mamaia). URLs o rutas de /public.
export const FOTOS_CEREMONIA = ['/iglesia-1.jpg', '/iglesia-2.jpg', '/iglesia-3.jpg', '/iglesia-4.jpg']
export const FOTOS_RECEPCION = ['/tictac-1.jpg', '/tictac-2.jpg', '/tictac-3.jpg', '/tictac-4.jpg']
