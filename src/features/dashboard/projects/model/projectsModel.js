// ═══════════════════════════════════════════
// projectsModel.js — Catálogos
// src/features/dashboard/projects/model/projectsModel.js
// ═══════════════════════════════════════════

// ── Estados disponibles ──
export const ESTADOS_PROYECTO = [
  { value: 'borrador', label: 'Borrador', labelKey: 'projects.status.borrador' },
  { value: 'publicado', label: 'Publicado', labelKey: 'projects.status.publicado' },
  { value: 'archivado', label: 'Archivado', labelKey: 'projects.status.archivado' },
  { value: 'en_desarrollo', label: 'En desarrollo', labelKey: 'projects.status.en_desarrollo' },
  { value: 'pausado', label: 'Pausado', labelKey: 'projects.status.pausado' },
  { value: 'terminado', label: 'Terminado', labelKey: 'projects.status.terminado' },
  { value: 'mantenimiento', label: 'Mantenimiento', labelKey: 'projects.status.mantenimiento' },
  { value: 'versionado', label: 'Versionado', labelKey: 'projects.status.versionado' },
  { value: 'cancelado', label: 'Cancelado', labelKey: 'projects.status.cancelado' },
];

// ── Tipos de proyecto ──
// IMPORTANTE:
// El value debe coincidir con proyectos.categoria_proyecto.
export const TIPOS_PROYECTO = [
  { value: 'sin_especificar', label: 'Sin especificar', labelKey: 'projects.type.sin_especificar' },
  { value: 'portafolio', label: 'Portafolio', labelKey: 'projects.type.portafolio' },
  { value: 'educativo', label: 'Proyecto educativo', labelKey: 'projects.type.educativo' },
  { value: 'financiero', label: 'Financiero', labelKey: 'projects.type.financiero' },
  { value: 'ecommerce', label: 'E-commerce', labelKey: 'projects.type.ecommerce' },
  { value: 'marketplace', label: 'Marketplace', labelKey: 'projects.type.marketplace' },
  { value: 'videojuego', label: 'Videojuego', labelKey: 'projects.type.videojuego' },
  { value: 'salud', label: 'Salud', labelKey: 'projects.type.salud' },
  { value: 'administrativo', label: 'Administrativo', labelKey: 'projects.type.administrativo' },
  { value: 'red_social', label: 'Red social', labelKey: 'projects.type.red_social' },
  { value: 'dashboard_bi', label: 'Dashboard / BI', labelKey: 'projects.type.dashboard_bi' },
  { value: 'gestion_empresarial', label: 'Gestión empresarial', labelKey: 'projects.type.gestion_empresarial' },
  { value: 'productividad', label: 'Productividad', labelKey: 'projects.type.productividad' },
  { value: 'seguridad', label: 'Seguridad', labelKey: 'projects.type.seguridad' },
  { value: 'entretenimiento', label: 'Entretenimiento', labelKey: 'projects.type.entretenimiento' },
  { value: 'herramienta_desarrollo', label: 'Herramienta de desarrollo', labelKey: 'projects.type.herramienta_desarrollo' },
  { value: 'otro', label: 'Otros', labelKey: 'projects.type.otro' },
];

// ── Plataforma objetivo ──
// IMPORTANTE:
// El value debe coincidir con proyectos.plataforma_objetivo.
export const DESARROLLADO_PARA = [
  { value: 'sin_especificar', label: 'Sin especificar', labelKey: 'projects.platform.sin_especificar' },
  { value: 'web', label: 'Web', labelKey: 'projects.platform.web' },
  { value: 'movil', label: 'Móvil', labelKey: 'projects.platform.movil' },
  { value: 'web_movil', label: 'Web + Móvil', labelKey: 'projects.platform.web_movil' },
  { value: 'escritorio', label: 'Escritorio', labelKey: 'projects.platform.escritorio' },
  { value: 'multiplataforma', label: 'Multiplataforma', labelKey: 'projects.platform.multiplataforma' },
  { value: 'api_backend', label: 'API / Backend', labelKey: 'projects.platform.api_backend' },
  { value: 'datos_ml', label: 'Datos / Machine Learning', labelKey: 'projects.platform.datos_ml' },
  { value: 'iot', label: 'IoT', labelKey: 'projects.platform.iot' },
  { value: 'cli', label: 'CLI / Terminal', labelKey: 'projects.platform.cli' },
  { value: 'otro', label: 'Otros', labelKey: 'projects.type.otro' },
];

// ── Catálogo de tecnologías agrupadas por categoría ──
// Cada entry: { id, nombre, categoria }
// El id es minúscula-sin-espacios para normalizar y evitar duplicados.
export const CATALOGO_TECNOLOGIAS = [
  // Frontend
  { id: 'react', nombre: 'React', categoria: 'Frontend' },
  { id: 'vue', nombre: 'Vue', categoria: 'Frontend' },
  { id: 'angular', nombre: 'Angular', categoria: 'Frontend' },
  { id: 'nextjs', nombre: 'Next.js', categoria: 'Frontend' },
  { id: 'nuxt', nombre: 'Nuxt', categoria: 'Frontend' },
  { id: 'svelte', nombre: 'Svelte', categoria: 'Frontend' },
  { id: 'astro', nombre: 'Astro', categoria: 'Frontend' },
  { id: 'tailwind', nombre: 'Tailwind', categoria: 'Frontend' },
  { id: 'bootstrap', nombre: 'Bootstrap', categoria: 'Frontend' },
  { id: 'sass', nombre: 'Sass', categoria: 'Frontend' },

  // Backend
  { id: 'nodejs', nombre: 'Node.js', categoria: 'Backend' },
  { id: 'express', nombre: 'Express', categoria: 'Backend' },
  { id: 'nestjs', nombre: 'NestJS', categoria: 'Backend' },
  { id: 'laravel', nombre: 'Laravel', categoria: 'Backend' },
  { id: 'php', nombre: 'PHP', categoria: 'Backend' },
  { id: 'django', nombre: 'Django', categoria: 'Backend' },
  { id: 'fastapi', nombre: 'FastAPI', categoria: 'Backend' },
  { id: 'flask', nombre: 'Flask', categoria: 'Backend' },
  { id: 'springboot', nombre: 'Spring Boot', categoria: 'Backend' },
  { id: 'java', nombre: 'Java', categoria: 'Backend' },
  { id: 'csharp', nombre: 'C#', categoria: 'Backend' },
  { id: 'dotnet', nombre: '.NET', categoria: 'Backend' },
  { id: 'rubyonrails', nombre: 'Ruby on Rails', categoria: 'Backend' },

  // Móvil
  { id: 'reactnative', nombre: 'React Native', categoria: 'Móvil' },
  { id: 'flutter', nombre: 'Flutter', categoria: 'Móvil' },
  { id: 'expo', nombre: 'Expo', categoria: 'Móvil' },
  { id: 'kotlin', nombre: 'Kotlin', categoria: 'Móvil' },
  { id: 'swift', nombre: 'Swift', categoria: 'Móvil' },

  // Lenguajes
  { id: 'javascript', nombre: 'JavaScript', categoria: 'Lenguaje' },
  { id: 'typescript', nombre: 'TypeScript', categoria: 'Lenguaje' },
  { id: 'python', nombre: 'Python', categoria: 'Lenguaje' },
  { id: 'rust', nombre: 'Rust', categoria: 'Lenguaje' },
  { id: 'go', nombre: 'Go', categoria: 'Lenguaje' },
  { id: 'cpp', nombre: 'C++', categoria: 'Lenguaje' },

  // Base de datos
  { id: 'postgresql', nombre: 'PostgreSQL', categoria: 'BD' },
  { id: 'mysql', nombre: 'MySQL', categoria: 'BD' },
  { id: 'mongodb', nombre: 'MongoDB', categoria: 'BD' },
  { id: 'redis', nombre: 'Redis', categoria: 'BD' },
  { id: 'sqlite', nombre: 'SQLite', categoria: 'BD' },
  { id: 'firebase', nombre: 'Firebase', categoria: 'BD' },
  { id: 'supabase', nombre: 'Supabase', categoria: 'BD' },

  // DevOps / Infra
  { id: 'docker', nombre: 'Docker', categoria: 'DevOps' },
  { id: 'kubernetes', nombre: 'Kubernetes', categoria: 'DevOps' },
  { id: 'aws', nombre: 'AWS', categoria: 'DevOps' },
  { id: 'gcp', nombre: 'GCP', categoria: 'DevOps' },
  { id: 'azure', nombre: 'Azure', categoria: 'DevOps' },
  { id: 'githubactions', nombre: 'GitHub Actions', categoria: 'DevOps' },

  // Herramientas
  { id: 'graphql', nombre: 'GraphQL', categoria: 'Herramienta' },
  { id: 'restapi', nombre: 'REST API', categoria: 'Herramienta' },
  { id: 'websockets', nombre: 'WebSockets', categoria: 'Herramienta' },
  { id: 'swagger', nombre: 'Swagger', categoria: 'Herramienta' },
  { id: 'jest', nombre: 'Jest', categoria: 'Herramienta' },
  { id: 'tomcat', nombre: 'Tomcat', categoria: 'Herramienta' },
  { id: 'apache', nombre: 'Apache', categoria: 'Herramienta' },
  { id: 'nginx', nombre: 'Nginx', categoria: 'Herramienta' },
  { id: 'jsp', nombre: 'JSP', categoria: 'Herramienta' },
];

// ─────────────────────────────────────────────────────
// normalizarId — normaliza un nombre de tecnología para
// detectar duplicados de forma case-insensitive y
// sin importar espacios, puntos, guiones o símbolos.
//
// Ejemplos:
//   "React Native"  → "reactnative"
//   "Node.js"       → "nodejs"
//   "C++"           → "c"
//   "PHP 8"         → "php8"
//   "REACT NATIVE"  → "reactnative"
// ─────────────────────────────────────────────────────
export function normalizarId(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .replace(/[ .\-+#/]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// ─────────────────────────────────────────────────────
// Helpers de traducción para catálogos.
// Los componentes pueden usar getProjectOptionLabel(option, t)
// sin romper los labels actuales.
// ─────────────────────────────────────────────────────
export function getProjectOptionLabel(option = {}, t = null) {
  if (!option) return '';
  if (typeof t === 'function' && option.labelKey) {
    return t(option.labelKey);
  }
  return option.label || option.nombre || option.value || '';
}

export function getProjectStatusLabel(value, t = null) {
  const option = ESTADOS_PROYECTO.find(item => item.value === value);
  return option ? getProjectOptionLabel(option, t) : (value || '');
}

export function getProjectTypeLabel(value, t = null) {
  const option = TIPOS_PROYECTO.find(item => item.value === value);
  return option ? getProjectOptionLabel(option, t) : (value || '');
}

export function getProjectPlatformLabel(value, t = null) {
  const option = DESARROLLADO_PARA.find(item => item.value === value);
  return option ? getProjectOptionLabel(option, t) : (value || '');
}
