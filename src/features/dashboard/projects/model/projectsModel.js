// ═══════════════════════════════════════════
// projectsModel.js — Datos mock + catálogos
// src/features/dashboard/projects/model/projectsModel.js
// ═══════════════════════════════════════════

// ── Tipos de proyecto (nuevo campo) ──
export const TIPOS_PROYECTO = [
  { value: 'web',          label: 'Web',              icon: '🌐' },
  { value: 'movil',        label: 'Móvil',             icon: '📱' },
  { value: 'movil_web',    label: 'Móvil + Web',       icon: '📱🌐' },
  { value: 'desktop',      label: 'Desktop',           icon: '🖥️' },
  { value: 'api',          label: 'API / Backend',     icon: '⚙️' },
  { value: 'datos',        label: 'Data / ML',         icon: '📊' },
  { value: 'juego',        label: 'Videojuego',        icon: '🎮' },
  { value: 'herramienta',  label: 'Herramienta / CLI', icon: '🔧' },
  { value: 'otro',         label: 'Otro',              icon: '📦' },
];

// ── Estados disponibles ──
export const ESTADOS_PROYECTO = [
  { value: 'publicado',   label: 'Publicado'     },
  { value: 'desarrollo',  label: 'En desarrollo' },
  { value: 'borrador',    label: 'Borrador'      },
  { value: 'archivado',   label: 'Archivado'     },
];

// ── Catálogo de tecnologías agrupadas por categoría ──
// Cada entry: { id, nombre, categoria }
// El id es minúscula-sin-espacios para normalizar y evitar duplicados
export const CATALOGO_TECNOLOGIAS = [
  // Frontend
  { id: 'react',        nombre: 'React',         categoria: 'Frontend' },
  { id: 'vue',          nombre: 'Vue',            categoria: 'Frontend' },
  { id: 'angular',      nombre: 'Angular',        categoria: 'Frontend' },
  { id: 'nextjs',       nombre: 'Next.js',        categoria: 'Frontend' },
  { id: 'nuxt',         nombre: 'Nuxt',           categoria: 'Frontend' },
  { id: 'svelte',       nombre: 'Svelte',         categoria: 'Frontend' },
  { id: 'astro',        nombre: 'Astro',          categoria: 'Frontend' },
  { id: 'tailwind',     nombre: 'Tailwind',       categoria: 'Frontend' },
  { id: 'bootstrap',    nombre: 'Bootstrap',      categoria: 'Frontend' },
  { id: 'sass',         nombre: 'Sass',           categoria: 'Frontend' },
  // Backend
  { id: 'nodejs',       nombre: 'Node.js',        categoria: 'Backend'  },
  { id: 'express',      nombre: 'Express',        categoria: 'Backend'  },
  { id: 'nestjs',       nombre: 'NestJS',         categoria: 'Backend'  },
  { id: 'laravel',      nombre: 'Laravel',        categoria: 'Backend'  },
  { id: 'php',          nombre: 'PHP',            categoria: 'Backend'  },
  { id: 'django',       nombre: 'Django',         categoria: 'Backend'  },
  { id: 'fastapi',      nombre: 'FastAPI',        categoria: 'Backend'  },
  { id: 'flask',        nombre: 'Flask',          categoria: 'Backend'  },
  { id: 'springboot',   nombre: 'Spring Boot',    categoria: 'Backend'  },
  { id: 'java',         nombre: 'Java',           categoria: 'Backend'  },
  { id: 'csharp',       nombre: 'C#',             categoria: 'Backend'  },
  { id: 'dotnet',       nombre: '.NET',           categoria: 'Backend'  },
  { id: 'rubyonrails',  nombre: 'Ruby on Rails',  categoria: 'Backend'  },
  // Móvil
  { id: 'reactnative',  nombre: 'React Native',   categoria: 'Móvil'    },
  { id: 'flutter',      nombre: 'Flutter',        categoria: 'Móvil'    },
  { id: 'expo',         nombre: 'Expo',           categoria: 'Móvil'    },
  { id: 'kotlin',       nombre: 'Kotlin',         categoria: 'Móvil'    },
  { id: 'swift',        nombre: 'Swift',          categoria: 'Móvil'    },
  // Lenguajes
  { id: 'javascript',   nombre: 'JavaScript',     categoria: 'Lenguaje' },
  { id: 'typescript',   nombre: 'TypeScript',     categoria: 'Lenguaje' },
  { id: 'python',       nombre: 'Python',         categoria: 'Lenguaje' },
  { id: 'rust',         nombre: 'Rust',           categoria: 'Lenguaje' },
  { id: 'go',           nombre: 'Go',             categoria: 'Lenguaje' },
  { id: 'cpp',          nombre: 'C++',            categoria: 'Lenguaje' },
  // Base de datos
  { id: 'postgresql',   nombre: 'PostgreSQL',     categoria: 'BD'       },
  { id: 'mysql',        nombre: 'MySQL',          categoria: 'BD'       },
  { id: 'mongodb',      nombre: 'MongoDB',        categoria: 'BD'       },
  { id: 'redis',        nombre: 'Redis',          categoria: 'BD'       },
  { id: 'sqlite',       nombre: 'SQLite',         categoria: 'BD'       },
  { id: 'firebase',     nombre: 'Firebase',       categoria: 'BD'       },
  { id: 'supabase',     nombre: 'Supabase',       categoria: 'BD'       },
  // DevOps / Infra
  { id: 'docker',       nombre: 'Docker',         categoria: 'DevOps'   },
  { id: 'kubernetes',   nombre: 'Kubernetes',     categoria: 'DevOps'   },
  { id: 'aws',          nombre: 'AWS',            categoria: 'DevOps'   },
  { id: 'gcp',          nombre: 'GCP',            categoria: 'DevOps'   },
  { id: 'azure',        nombre: 'Azure',          categoria: 'DevOps'   },
  { id: 'githubactions',nombre: 'GitHub Actions', categoria: 'DevOps'   },
  // Herramientas
  { id: 'graphql',      nombre: 'GraphQL',        categoria: 'Herramienta' },
  { id: 'restapi',      nombre: 'REST API',       categoria: 'Herramienta' },
  { id: 'websockets',   nombre: 'WebSockets',     categoria: 'Herramienta' },
  { id: 'swagger',      nombre: 'Swagger',        categoria: 'Herramienta' },
  { id: 'jest',         nombre: 'Jest',           categoria: 'Herramienta' },
  { id: 'tomcat',       nombre: 'Tomcat',         categoria: 'Herramienta' },
  { id: 'apache',       nombre: 'Apache',         categoria: 'Herramienta' },
  { id: 'nginx',        nombre: 'Nginx',          categoria: 'Herramienta' },
  { id: 'jsp',          nombre: 'JSP',            categoria: 'Herramienta' },
];


// ── Mock de proyectos ──
export const MOCK_PROYECTOS = [
  {
    id: 1,
    titulo: 'Sistema de Gestión Académica — UMSS',
    descripcion: 'Plataforma web para inscripciones, notas y horarios del Dpto. de Informática. Módulos para docentes, estudiantes y administradores con roles diferenciados.',
    url_repositorio: 'https://github.com/usuario/gestion-academica',
    url_demo: 'https://demo.gestion-academica.edu.bo',
    imagen_portada: 'https://images.unsplash.com/photo-1607743386760-88ac62b89b8a?w=800&q=80',
    es_publico: true,
    fecha_inicio: '2023-03-01',
    fecha_fin: '2024-01-15',
    en_curso: false,
    tipo: 'web',
    etiquetas: ['PHP', 'MySQL', 'Apache', 'Bootstrap'],
    estado: 'publicado',
    estadoLabel: 'En línea',
    badges: [
      { label: 'Publicado', variant: 'green' },
      { label: 'Académico', variant: 'blue' },
    ],
  },
  {
    id: 2,
    titulo: 'Inventario & Ventas — Ferrería Central',
    descripcion: 'App web para control de inventario, ventas y reportes PDF. Implementada en Java con Tomcat y PostgreSQL para cliente real en producción.',
    url_repositorio: 'https://github.com/usuario/inventario-ferreteria',
    url_demo: null,
    imagen_portada: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    es_publico: true,
    fecha_inicio: '2023-08-01',
    fecha_fin: '2024-02-20',
    en_curso: false,
    tipo: 'web',
    etiquetas: ['Java', 'PostgreSQL', 'Tomcat', 'JSP'],
    estado: 'publicado',
    estadoLabel: 'Producción',
    badges: [
      { label: 'Publicado', variant: 'green' },
      { label: 'Freelance', variant: 'gray' },
    ],
  },
  {
    id: 3,
    titulo: 'API REST — Generador de Portafolios',
    descripcion: 'Backend modular con autenticación JWT, carga de archivos y generación automática de portafolios en PDF. Documentación en Swagger/OpenAPI.',
    url_repositorio: 'https://github.com/usuario/portafolio-api',
    url_demo: 'https://docs.portafolio-api.dev',
    imagen_portada: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    es_publico: false,
    fecha_inicio: '2024-06-01',
    fecha_fin: null,
    en_curso: true,
    tipo: 'api',
    etiquetas: ['Laravel', 'PHP', 'Redis', 'Docker'],
    estado: 'desarrollo',
    estadoLabel: 'En desarrollo',
    badges: [
      { label: 'En desarrollo', variant: 'amber' },
      { label: 'Open Source', variant: 'gray' },
    ],
  },
  {
    id: 4,
    titulo: 'NeuroWake — App de Alarmas Cognitivas',
    descripcion: 'App móvil que requiere completar desafíos físicos, visuales o cognitivos para apagar la alarma. Previene el snooze automático.',
    url_repositorio: 'https://github.com/usuario/neurowake',
    url_demo: 'https://neurowake.app',
    imagen_portada: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    es_publico: true,
    fecha_inicio: '2024-09-01',
    fecha_fin: null,
    en_curso: true,
    tipo: 'movil_web',
    etiquetas: ['React Native', 'Expo', 'Node.js', 'SQLite'],
    estado: 'publicado',
    estadoLabel: 'En línea',
    badges: [
      { label: 'Publicado', variant: 'green' },
      { label: 'Móvil + Web', variant: 'purple' },
    ],
  },
];

export const MOCK_VISIBILIDAD_GLOBAL = true;
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
//   "REACT NATIVE"  → "reactnative"   (igual que el primero)
// ─────────────────────────────────────────────────────
export function normalizarId(nombre) {
  return nombre
    .toLowerCase()
    .replace(/[ .\-+#/]/g, '')
    .replace(/[^a-z0-9]/g, '');
}