import {
  getSkillProgress,
  getSkillLevelLabel,
  getSkillLevelShortLabel,
} from "./skillLevel";

describe("HU Gestión de habilidades - niveles", () => {
  test("retorna el porcentaje correcto según el nivel", () => {
    expect(getSkillProgress("basico")).toBe(25);
    expect(getSkillProgress("intermedio")).toBe(50);
    expect(getSkillProgress("avanzado")).toBe(75);
    expect(getSkillProgress("experto")).toBe(100);
  });

  test("retorna etiquetas correctas para mostrar en pantalla", () => {
    expect(getSkillLevelLabel("basico")).toBe("Básico");
    expect(getSkillLevelLabel("intermedio")).toBe("Intermedio");
    expect(getSkillLevelShortLabel("avanzado")).toBe("AVZ");
    expect(getSkillLevelShortLabel("experto")).toBe("EXP");
  });
});