// ═══════════════════════════════════════════
// projectsModel.js — Catálogos
// src/features/dashboard/projects/model/projectsModel.js
// ═══════════════════════════════════════════

// ── Estados disponibles ──
export const ESTADOS_PROYECTO = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'archivado', label: 'Archivado' },
  { value: 'en_desarrollo', label: 'En desarrollo' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'terminado', label: 'Terminado' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'versionado', label: 'Versionado' },
  { value: 'cancelado', label: 'Cancelado' },
];

// ── Tipos de proyecto ──
// IMPORTANTE:
// El value debe coincidir con proyectos.categoria_proyecto.
export const TIPOS_PROYECTO = [
  { value: 'sin_especificar', label: 'Sin especificar' },
  { value: 'portafolio', label: 'Portafolio' },
  { value: 'educativo', label: 'Proyecto educativo' },
  { value: 'financiero', label: 'Financiero' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'videojuego', label: 'Videojuego' },
  { value: 'salud', label: 'Salud' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'red_social', label: 'Red social' },
  { value: 'dashboard_bi', label: 'Dashboard / BI' },
  { value: 'gestion_empresarial', label: 'Gestión empresarial' },
  { value: 'productividad', label: 'Productividad' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'entretenimiento', label: 'Entretenimiento' },
  { value: 'herramienta_desarrollo', label: 'Herramienta de desarrollo' },
  { value: 'otro', label: 'Otros' },
];

// ── Plataforma objetivo ──
// IMPORTANTE:
// El value debe coincidir con proyectos.plataforma_objetivo.
export const DESARROLLADO_PARA = [
  { value: 'sin_especificar', label: 'Sin especificar' },
  { value: 'web', label: 'Web' },
  { value: 'movil', label: 'Móvil' },
  { value: 'web_movil', label: 'Web + Móvil' },
  { value: 'escritorio', label: 'Escritorio' },
  { value: 'multiplataforma', label: 'Multiplataforma' },
  { value: 'api_backend', label: 'API / Backend' },
  { value: 'datos_ml', label: 'Datos / Machine Learning' },
  { value: 'iot', label: 'IoT' },
  { value: 'cli', label: 'CLI / Terminal' },
  { value: 'otro', label: 'Otros' },
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
