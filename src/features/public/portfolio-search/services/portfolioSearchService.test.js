import {
  SEARCH_AUTH_REQUIRED_MESSAGE,
  buildSearchPayload,
  normalizeSearchResponse,
  getSearchCatalog,
} from "./portfolioSearchService";

describe("HU Búsqueda avanzada de portafolios - payload V2", () => {
  test("arma correctamente el payload con habilidades, experiencia y proyectos", () => {
    const filters = {
      query: "react developer",
      usuario: {
        nombre: "Aaron",
        ciudad: ["Cochabamba"],
        pais: ["Bolivia"],
        profesion: ["Desarrollador"],
      },
      habilidades: {
        tecnicas: [{ nombre: "React", nivel: "intermedio" }],
        blandas: [{ nombre: "Liderazgo", nivel: "basico" }],
      },
      experiencia: [
        { cargo: "Backend", tipos: ["laboral"] },
      ],
      proyectos: {
        tecnologias: ["TypeScript"],
        tipo: ["web"],
        estado: ["publicado"],
      },
      orden: {
        direccion: "desc",
        fecha_desde: "",
        prioridad: "habilidades",
      },
      per_page: 12,
    };

    const payload = buildSearchPayload(filters);

    expect(payload.query).toBe("react developer");

    expect(payload.usuario).toEqual({
      nombre: "Aaron",
      ciudad: ["Cochabamba"],
      pais: ["Bolivia"],
      profesion: ["Desarrollador"],
    });

    expect(payload.habilidades.tecnicas).toEqual({
      items: ["React"],
      niveles: ["intermedio"],
    });

    expect(payload.habilidades.blandas).toEqual({
      items: ["Liderazgo"],
      niveles: ["basico"],
    });

    expect(payload.experiencia).toEqual([
      { cargo: "Backend", tipos: ["laboral"] },
    ]);

    expect(payload.proyectos).toEqual({
      tecnologias: ["TypeScript"],
      tipo: ["web"],
      estado: ["publicado"],
    });

    expect(payload.orden).toEqual({
      direccion: "desc",
      fecha_desde: "",
      priorizar_proyectos: false,
      priorizar_experiencia: false,
      priorizar_habilidades: true,
    });

    expect(payload.per_page).toBe(12);
  });

  test("limpia espacios y elimina valores duplicados en listas", () => {
    const filters = {
      query: "  laravel  ",
      usuario: {
        ciudad: [" Cochabamba ", "cochabamba", "La Paz"],
        pais: [" Bolivia ", "Bolivia"],
        profesion: [" Backend Developer "],
      },
      habilidades: {
        tecnicas: [
          { nombre: " React ", nivel: " avanzado " },
          { nombre: "React", nivel: "avanzado" },
        ],
        blandas: [],
      },
      experiencia: [],
      proyectos: {
        tecnologias: [" PHP ", "PHP", "Laravel"],
        tipo: [],
        estado: [],
      },
      orden: {
        prioridad: "proyectos",
      },
    };

    const payload = buildSearchPayload(filters);

    expect(payload.query).toBe("laravel");
    expect(payload.usuario.ciudad).toEqual(["Cochabamba", "La Paz"]);
    expect(payload.usuario.pais).toEqual(["Bolivia"]);
    expect(payload.habilidades.tecnicas.items).toEqual(["React"]);
    expect(payload.habilidades.tecnicas.niveles).toEqual(["avanzado"]);
    expect(payload.proyectos.tecnologias).toEqual(["PHP", "Laravel"]);
    expect(payload.orden.priorizar_proyectos).toBe(true);
    expect(payload.orden.priorizar_experiencia).toBe(false);
    expect(payload.orden.priorizar_habilidades).toBe(false);
  });
});

describe("HU Búsqueda avanzada de portafolios - respuesta del backend", () => {
  test("normaliza la respuesta con data y meta del backend V2", () => {
    const response = {
      data: [
        {
          id_usuario: 2,
          nombre: "Aaron",
          apellido: "Parra",
          profesion: "Desarrollador",
          ciudad: "Cochabamba",
          pais: "Bolivia",
          tecnologias_relacionadas: "PHP, React",
        },
      ],
      meta: {
        total: 1,
        por_pagina: 12,
        pagina_actual: 1,
        ultima_pagina: 1,
      },
      message: "Mostrando 1 portafolio",
    };

    const normalized = normalizeSearchResponse(response);

    expect(normalized.items).toHaveLength(1);
    expect(normalized.items[0].nombre).toBe("Aaron");
    expect(normalized.meta).toEqual({
      total: 1,
      per_page: 12,
      current_page: 1,
      last_page: 1,
    });
    expect(normalized.message).toBe("Mostrando 1 portafolio");
  });

  test("normaliza una respuesta vacía sin romper la pantalla", () => {
    const normalized = normalizeSearchResponse({
      data: [],
      meta: {
        total: 0,
        por_pagina: 12,
        pagina_actual: 1,
        ultima_pagina: 1,
      },
      message: "No se encontraron portafolios",
    });

    expect(normalized.items).toEqual([]);
    expect(normalized.meta.total).toBe(0);
    expect(normalized.message).toBe("No se encontraron portafolios");
  });
});

describe("HU Búsqueda avanzada de portafolios - catálogos", () => {
  beforeEach(() => {
    window.localStorage.setItem("tokenPORT", "fake-token");
    global.fetch = jest.fn();
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    jest.restoreAllMocks();
  });

  test("obtiene sugerencias cuando el backend devuelve strings", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ["React", "PHP", "TypeScript"],
    });

    const catalog = await getSearchCatalog("tecnologias-proyecto");

    expect(catalog).toEqual(["React", "PHP", "TypeScript"]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("obtiene sugerencias cuando el backend devuelve objetos", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { nombre: "React" },
        { name: "Laravel" },
        { titulo: "Backend Developer" },
        { valor: "Full Stack" },
      ],
    });

    const catalog = await getSearchCatalog("profesiones");

    expect(catalog).toEqual([
      "React",
      "Laravel",
      "Backend Developer",
      "Full Stack",
    ]);
  });

  test("muestra error claro si no existe token de autenticación", async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();

    await expect(getSearchCatalog("profesiones")).rejects.toThrow(
      SEARCH_AUTH_REQUIRED_MESSAGE
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});