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
  '#000000',
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
  { id: 'none', label: 'Sin patron' },
  { id: 'dots', label: 'Puntos' },
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'hex', label: 'Hexágonos' },
  { id: 'none', label: 'Sin patrón' },
  { id: 'waves', label: 'Ondas' },
].filter((pattern, index, list) => (
  list.findIndex(item => item.id === pattern.id) === index
)).map(pattern => ({
  ...pattern,
  label: {
    grid: 'Cuadricula',
    hex: 'Hexagonos',
    none: 'Sin patron',
  }[pattern.id] || pattern.label,
}));

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
  { id: 'none', label: 'Sin borde' },
  { id: 'thick', label: 'Grueso' },
  { id: 'mac', label: 'Mac OS' },
  { id: 'linux', label: 'Linux' },
  { id: 'windows', label: 'Windows' },
].filter((frame, index, list) => (
  list.findIndex(item => item.id === frame.id) === index
));
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

  habilidades: {},
  experiencias: {},
  proyectos: {},
  proyecto_detalles: {
    media: true,
    estado: true,
    tipo: true,
    descripcion: true,
    tecnologias: true,
    repositorios: true,
    demo: true,
    videos: true,
    documentos: true,
    fechas: true,
    rol: true,
    aporte: true,
    participantes: true,
  },
};

export const DEFAULT_CONFIG = {
  heroColor: '#0c1a2e',
  heroBgSource: 'custom',
  heroPattern: 'none',

  avatarBgSource: 'custom',
  avatarColor: '#0077b7',

  accentColor: '#0077b7',
  cardBg: '#ffffff',

  textColorAuto: true,
  textColor: '#111827',

  fontId: 'inter',
  frameId: 'none',

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

export const EMPTY_VIEW = {
  perfil: null,
  redes: [],
  stats: [],
  habilidades: {
    tecnicas: [],
    blandas: [],
  },
  experiencias: [],
  proyectos: [],
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
