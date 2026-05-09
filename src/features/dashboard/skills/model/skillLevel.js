export const SKILL_LEVELS = {
  basico: {
    percentage: 25,
    color: "var(--gris-texto)",
    label: "Básico",
    shortLabel: "BAS",
  },
  intermedio: {
    percentage: 50,
    color: "var(--verde-hover)",
    label: "Intermedio",
    shortLabel: "INT",
  },
  avanzado: {
    percentage: 75,
    color: "var(--azul)",
    label: "Avanzado",
    shortLabel: "AVZ",
  },
  experto: {
    percentage: 100,
    color: "var(--violeta-hover)",
    label: "Experto",
    shortLabel: "EXP",
  },
};

export function normalizeSkillLevel(level = "") {
  const normalized = level
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized || "intermedio";
}

export function getSkillLevelConfig(level = "") {
  const normalized = normalizeSkillLevel(level);

  return SKILL_LEVELS[normalized] || SKILL_LEVELS.intermedio;
}

export function getSkillProgress(level = "") {
  return getSkillLevelConfig(level).percentage;
}

export function getSkillLevelColor(level = "") {
  return getSkillLevelConfig(level).color;
}

export function getSkillLevelLabel(level = "") {
  return getSkillLevelConfig(level).label;
}

export function getSkillLevelShortLabel(level = "") {
  return getSkillLevelConfig(level).shortLabel;
}