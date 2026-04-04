// ═══════════════════════════════════════════
// PROFILE MODEL — Datos mock hasta que el
// backend esté listo.
// CONEXIÓN BACKEND: reemplazar mockProfile
// con la respuesta real de la API.
// ═══════════════════════════════════════════

export const mockProfile = {
  id: 1,
  nombre: 'Aaron',
  apellido: 'Parra Merino',
  profesion: 'Dev Full Stack',
  universidad: 'UMSS',
  biografia: 'Desarrollador apasionado por crear soluciones digitales de impacto. Especializado en React y Laravel.',
  correo: 'aaron@ejemplo.com',
  pais: 'Bolivia',
  ciudad: 'Cochabamba',
  telefono: '+591 70000000',
  // Visibilidad de cada campo (true = público, false = oculto)
  visibilidad: {
    nombre: true,
    correo: true,
    pais: true,
    profesion: true,
    ciudad: true,
    telefono: false,
    biografia: false,
  },
};