export const SKILL_LEVELS = {
  basico: {
    percentage: 30,
    color: '#64748b',
    label: 'Basico',
  },
  intermedio: {
    percentage: 60,
    color: '#16a34a',
    label: 'Intermedio',
  },
  avanzado: {
    percentage: 85,
    color: '#2563eb',
    label: 'Avanzado',
  },
  experto: {
    percentage: 100,
    color: '#7c3aed',
    label: 'Experto',
  },
};

export function normalizeSkillLevel(level = '') {
  return level
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') || 'intermedio';
}

export function getSkillLevelConfig(level = '') {
  const normalized = normalizeSkillLevel(level);
  return SKILL_LEVELS[normalized] || SKILL_LEVELS.intermedio;
}

export function getSkillProgress(level = '') {
  return getSkillLevelConfig(level).percentage;
}

export function getSkillLevelColor(level = '') {
  return getSkillLevelConfig(level).color;
}

export function getSkillLevelLabel(level = '') {
  return getSkillLevelConfig(level).label;
}
