import {
  normalizeSkillText,
  formatSkillDisplayName,
} from "./skillService";

describe("HU Gestión de habilidades - normalización y formato", () => {
  test("normaliza nombres quitando espacios, tildes y mayúsculas", () => {
    expect(normalizeSkillText("  Inglés  ")).toBe("ingles");
    expect(normalizeSkillText("COMUNICACIÓN")).toBe("comunicacion");
    expect(normalizeSkillText("Trabajo   en   Equipo")).toBe("trabajo en equipo");
  });

  test("formatea tecnologías conocidas con escritura estándar", () => {
    expect(formatSkillDisplayName("dart")).toBe("Dart");
    expect(formatSkillDisplayName("javascript")).toBe("JavaScript");
    expect(formatSkillDisplayName("mysql")).toBe("MySQL");
    expect(formatSkillDisplayName("postgresql")).toBe("PostgreSQL");
    expect(formatSkillDisplayName("nodejs")).toBe("Node.js");
  });

  test("formatea habilidades blandas conocidas", () => {
    expect(formatSkillDisplayName("ingles")).toBe("Inglés");
    expect(formatSkillDisplayName("comunicacion")).toBe("Comunicación");
    expect(formatSkillDisplayName("trabajo en equipo")).toBe("Trabajo en equipo");
  });

  test("formatea palabras desconocidas con mayúscula inicial", () => {
    expect(formatSkillDisplayName("pensamiento critico")).toBe("Pensamiento Critico");
    expect(formatSkillDisplayName("gestion del tiempo")).toBe("Gestion del Tiempo");
  });
});