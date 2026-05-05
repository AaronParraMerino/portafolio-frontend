// src/features/dashboard/view/model/viewModel.js

export const HERO_COLORS = [
  '#0077b7', '#005f95', '#004f7c', '#0c1a2e', '#1a0a2e',
  '#111827', '#374151', '#e85555', '#c94040', '#34d399',
  '#28b882', '#fbbf24', '#e0a813', '#c4b5fd', '#7c3aed',
  '#4f46e5', '#0891b2', '#0d9488', '#16a34a', '#db2777',
  '#ea580c', '#ca8a04',
];

export const AVATAR_COLORS = [
  '#0077b7', '#005f95', '#004f7c', '#0c1a2e', '#111827',
  '#374151', '#e85555', '#34d399', '#fbbf24', '#c4b5fd',
  '#7c3aed', '#0891b2', '#0d9488', '#16a34a', '#db2777',
  '#ea580c',
];

export const ACCENT_COLORS = [
  '#0077b7', '#005f95', '#004f7c', '#e85555', '#c94040',
  '#34d399', '#28b882', '#fbbf24', '#e0a813', '#c4b5fd',
  '#7c3aed', '#4f46e5', '#0891b2', '#0d9488', '#16a34a',
  '#db2777', '#ea580c', '#374151',
];

export const CARD_COLORS = [
  '#ffffff',
  '#f0ede8',
  '#e8f4fb',
  '#fdf0f0',
  '#f0fdf7',
  '#fffbeb',
  '#f5f3ff',
  '#f8fafc',
  '#111827',
  '#1e293b',
  '#18181b',
  '#0f172a',
];

export const PATTERNS = [
  { id: 'dots', label: 'Puntos' },
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'hex', label: 'Hexágonos' },
  { id: 'none', label: 'Sin patrón' },
];

export const FONTS = [
  {
    id: 'inter',
    label: 'Inter',
    value: "'Inter', sans-serif",
    preview: 'Moderno · limpio · profesional',
  },
  {
    id: 'mono',
    label: 'IBM Plex Mono',
    value: "'IBM Plex Mono', monospace",
    preview: 'Técnico · preciso · dev',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    value: "'Georgia', serif",
    preview: 'Clásico · elegante · editorial',
  },
  {
    id: 'system',
    label: 'Sistema',
    value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    preview: 'Nativo · rápido · familiar',
  },
];

export const FRAMES = [
  { id: 'thick', label: 'Grueso' },
  { id: 'mac', label: 'Mac OS' },
  { id: 'linux', label: 'Linux' },
  { id: 'windows', label: 'Windows' },
  { id: 'none', label: 'Sin borde' },
];
export const DEFAULT_VISIBILITY = {
  perfil: {
    nombre: true,
    profesion: true,
    ubicacion: true,
    telefono: true,
    correo: true,
    redes: true,
    biografia: true,
  },

  stats: {
    proyectos: true,
    tecnologias: true,
    academica: true,
    laboral: true,
  },

  habilidades: {
    'tec-php': true,
    'tec-mysql': true,
    'tec-html-css': true,
    'tec-java': true,
    'tec-js': true,
    'tec-git': true,
    'soft-team': true,
    'soft-problem': true,
    'soft-communication': true,
    'soft-agile': true,
  },

  experiencias: {
    'exp-1': true,
    'exp-2': true,
    'exp-3': true,
  },

  proyectos: {
    'proy-1': true,
    'proy-2': true,
    'proy-3': true,
    'proy-4': true,
  },
};

export const DEFAULT_CONFIG = {
  heroColor: '#0c1a2e',
  heroBgSource: 'custom',
  heroPattern: 'dots',

  avatarBgSource: 'custom',
  avatarColor: '#0077b7',

  accentColor: '#0077b7',
  cardBg: '#ffffff',

  textColorAuto: true,
  textColor: '#111827',

  fontId: 'inter',
  frameId: 'mac',

  disponible: true,

  visibilidad: DEFAULT_VISIBILITY,
};

export const TEXT_COLORS = [
  '#111827',
  '#374151',
  '#6b7280',
  '#ffffff',
  '#f9fafb',
  '#e5e7eb',
  '#0077b7',
  '#005f95',
  '#004f7c',
  '#e85555',
  '#c94040',
  '#34d399',
  '#28b882',
  '#fbbf24',
  '#7c3aed',
  '#4f46e5',
];

export const MOCK_VIEW = {
  perfil: {
    nombre: 'Aaron',
    apellido: 'Parra Merino',
    profesion: 'Desarrollador Web Full Stack · Backend Specialist',
    ciudad: 'Cochabamba',
    pais: 'Bolivia',
    telefono: '+591 7 000-0000',
    correo: 'aaron@test.com',
    biografia:
      'Soy un desarrollador web full stack con más de 3 años de experiencia construyendo sistemas de información empresariales. Me especializo en PHP / MySQL y tengo sólidos conocimientos en Java con Tomcat. Me apasiona aplicar principios de Ingeniería de Software — desde el análisis de requerimientos hasta el despliegue — para entregar soluciones que resuelven problemas reales. Actualmente curso el último año de la Licenciatura en Informática en la UMSS.',
  },

  redes: [
    {
      id: 'linkedin',
      nombre: 'LinkedIn',
      url: 'linkedin.com/in/aaronparra',
      href: 'https://linkedin.com/in/aaronparra',
      tipo: 'linkedin',
    },
    {
      id: 'github',
      nombre: 'GitHub',
      url: 'github.com/aaronparra',
      href: 'https://github.com/aaronparra',
      tipo: 'github',
    },
    {
      id: 'twitter',
      nombre: 'Twitter / X',
      url: 'x.com/aaronparra',
      href: 'https://x.com/aaronparra',
      tipo: 'twitter',
    },
    {
      id: 'web',
      nombre: 'Portafolio Web',
      url: 'aaronparra.dev',
      href: 'https://aaronparra.dev',
      tipo: 'web',
    },
  ],

  stats: [
    { id: 'proyectos', valor: '4', label: 'Proyectos' },
    { id: 'tecnologias', valor: '8', label: 'Tecnologías' },
    { id: 'academica', valor: '1', label: 'Exp. Académica' },
    { id: 'laboral', valor: '2', label: 'Exp. Laboral' },
  ],

habilidades: {
  tecnicas: [
    {
      id: 'tec-php',
      nombre: 'PHP',
      nivel: 'avanzado',
      porcentaje: 90,
      descripcion: 'Laravel, APIs REST, arquitectura MVC y lógica backend.',
    },
    {
      id: 'tec-mysql',
      nombre: 'MySQL',
      nivel: 'avanzado',
      porcentaje: 88,
      descripcion: 'Diseño de esquemas, joins complejos y optimización.',
    },
    {
      id: 'tec-html-css',
      nombre: 'HTML / CSS',
      nivel: 'experto',
      porcentaje: 95,
      descripcion: 'Maquetado responsivo, accesibilidad y diseño modular.',
    },
    {
      id: 'tec-java',
      nombre: 'Java',
      nivel: 'intermedio',
      porcentaje: 70,
      descripcion: 'Aplicaciones web con Tomcat, JSP y patrones MVC.',
    },
    {
      id: 'tec-js',
      nombre: 'JavaScript',
      nivel: 'intermedio',
      porcentaje: 65,
      descripcion: 'Interactividad frontend, DOM y consumo de APIs.',
    },
    {
      id: 'tec-git',
      nombre: 'Git',
      nivel: 'avanzado',
      porcentaje: 82,
      descripcion: 'Control de versiones, ramas, merges y colaboración.',
    },
  ],

  blandas: [
    {
      id: 'soft-team',
      nombre: 'Trabajo en equipo',
      nivel: 'experto',
      porcentaje: 95,
      descripcion: 'Colaboración efectiva en equipos multidisciplinarios.',
    },
    {
      id: 'soft-problem',
      nombre: 'Resolución de problemas',
      nivel: 'avanzado',
      porcentaje: 85,
      descripcion: 'Análisis de problemas y propuesta de soluciones prácticas.',
    },
    {
      id: 'soft-communication',
      nombre: 'Comunicación efectiva',
      nivel: 'avanzado',
      porcentaje: 80,
      descripcion: 'Comunicación clara con perfiles técnicos y no técnicos.',
    },
    {
      id: 'soft-agile',
      nombre: 'Metodologías ágiles',
      nivel: 'intermedio',
      porcentaje: 72,
      descripcion: 'Participación en sprints, reuniones y revisión de avances.',
    },
  ],
},

experiencias: [
  {
    id: 'exp-1',
    tipo: 'laboral',
    actual: true,
    cargo: 'Desarrollador Web Junior',
    organizacion: 'TIS Solutions S.R.L.',
    fechas: 'Mar 2024 → Presente',
    descripcion:
      'Desarrollo y mantenimiento de sistemas web empresariales con PHP y MySQL, participando en análisis, diseño, codificación, pruebas y despliegue.',
  },
  {
    id: 'exp-2',
    tipo: 'laboral',
    actual: false,
    cargo: 'Pasante de Desarrollo de Software',
    organizacion: 'Municipio de Cochabamba',
    fechas: 'Ene 2023 → Jul 2023',
    descripcion:
      'Desarrollo de módulos internos para el sistema de gestión municipal. Trabajo colaborativo usando metodología ágil y revisiones de sprint.',
  },
  {
    id: 'exp-3',
    tipo: 'academico',
    actual: true,
    cargo: 'Licenciatura en Informática',
    organizacion: 'Universidad Mayor de San Simón',
    fechas: 'Feb 2020 → 2026',
    descripcion:
      'Formación en ingeniería de software, bases de datos, algoritmos, redes, gestión de proyectos y metodologías ágiles.',
  },
],

proyectos: [
  {
    id: 'proy-1',
    titulo: 'Sistema de Gestión Académica — UMSS',
    descripcion:
      'Gestión de inscripciones, notas y horarios con módulos para docentes, estudiantes y administradores.',
    estado: 'publicado',
    tipo: 'Académico',
    anio: '2024',
    icono: 'school',
    tecnologias: ['PHP', 'MySQL', 'Apache', 'Bootstrap'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://example.com',
    videoUrl: '',
  },
  {
    id: 'proy-2',
    titulo: 'Inventario & Ventas — Ferretería Central',
    descripcion:
      'Control de inventario, ventas y reportes PDF implementado en Java con Tomcat y PostgreSQL.',
    estado: 'publicado',
    tipo: 'Freelance',
    anio: '2023',
    icono: 'box',
    tecnologias: ['Java', 'PostgreSQL', 'Tomcat', 'JSP'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://example.com',
    videoUrl: '',
  },
  {
    id: 'proy-3',
    titulo: 'API REST — Gestión de Finanzas Personales',
    descripcion:
      'API RESTful con JWT, documentación Swagger y endpoints para control de ingresos y egresos.',
    estado: 'publicado',
    tipo: 'API',
    anio: '2024',
    icono: 'api',
    tecnologias: ['PHP', 'MySQL', 'JWT', 'Swagger'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://example.com',
    videoUrl: '',
  },
  {
    id: 'proy-4',
    titulo: 'DevPortafolio — Plataforma académica',
    descripcion:
      'Sistema de portafolios profesionales para estudiantes universitarios con gestión de proyectos y visibilidad configurable.',
    estado: 'desarrollo',
    tipo: 'Plataforma',
    anio: '2025',
    icono: 'portfolio',
    tecnologias: ['PHP', 'MySQL', 'Apache', 'Scrum'],
    githubUrl: 'https://github.com',
    demoUrl: '',
    videoUrl: 'https://youtube.com',
  },
],

  config: DEFAULT_CONFIG,
};

export function getFullName(perfil) {
  if (!perfil) return 'Mi Portafolio';
  return `${perfil.nombre || ''} ${perfil.apellido || ''}`.trim() || 'Mi Portafolio';
}

export function getInitial(perfil) {
  const nombre = perfil?.nombre || '';
  const apellido = perfil?.apellido || '';
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.trim().toUpperCase() || 'U';
}

export function isVisible(visibilidad, grupo, id) {
  return visibilidad?.[grupo]?.[id] !== false;
}

export function hexToRgb(hex = '#ffffff') {
  const clean = hex.replace('#', '');

  if (clean.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function getLuminance(hex = '#ffffff') {
  const { r, g, b } = hexToRgb(hex);

  const normalize = value => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const rr = normalize(r);
  const gg = normalize(g);
  const bb = normalize(b);

  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
}

export function getAutoTextColor(backgroundColor = '#ffffff') {
  return getLuminance(backgroundColor) > 0.45
    ? '#111827'
    : '#f9fafb';
}