// ═══════════════════════════════════════════
// PROFILE MODEL — Datos mock hasta que el
// backend esté listo.
// CONEXIÓN BACKEND: reemplazar mockProfile
// con la respuesta real de la API.
// ═══════════════════════════════════════════

export const mockProfile = {
  id: 1,
  nombre: 'Aaron Parra Merino',
  profesion: 'Dev Full Stack',
  universidad: 'UMSS',
  biografia: 'Desarrollador apasionado por crear soluciones digitales de impacto. Especializado en React y Laravel.',
  correo: 'aaron@ejemplo.com',
  pais: 'Bolivia',
  ciudad: 'Cochabamba',
  telefono: '+591 70000000',
  linkedin: 'https://linkedin.com/in/aaron',
  github: 'https://github.com/AaronParraMerino',
  // Visibilidad de cada campo (true = público, false = oculto)
  visibilidad: {
    nombre: true,
    correo: true,
    pais: true,
    ciudad: true,
    telefono: false,
    biografia: false,
  },
  stats: {
    proyectos: 4,
    habilidades: 8,
    completitud: 72,
  },
  habilidades: [
    { id: 1, nombre: 'React.js',    tipo: 'tecnica', nivel: 'avanzado' },
    { id: 2, nombre: 'Laravel',     tipo: 'tecnica', nivel: 'avanzado' },
    { id: 3, nombre: 'PostgreSQL',  tipo: 'tecnica', nivel: 'intermedio' },
    { id: 4, nombre: 'Python',      tipo: 'tecnica', nivel: 'intermedio' },
    { id: 5, nombre: 'Docker',      tipo: 'tecnica', nivel: 'basico' },
    { id: 6, nombre: 'TypeScript',  tipo: 'tecnica', nivel: 'intermedio' },
    { id: 7, nombre: 'Trabajo en equipo', tipo: 'blanda', nivel: 'avanzado' },
    { id: 8, nombre: 'Comunicación',      tipo: 'blanda', nivel: 'avanzado' },
  ],
};