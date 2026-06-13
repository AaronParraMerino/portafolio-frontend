import { applyGlobalSuggestion } from './globalSuggestionFilters';

const filters = {
  query: 'rea',
  usuario: { nombre: '', ciudad: [], pais: [], profesion: [] },
  habilidades: { tecnicas: [], blandas: [] },
  experiencia: [],
  proyectos: { tecnologias: [], tipo: [], estado: [] },
};

test('convierte una habilidad tipada en el filtro lateral equivalente', () => {
  const result = applyGlobalSuggestion(filters, {
    type: 'technicalSkill',
    value: 'React',
    qualifier: 'intermedio',
  });

  expect(result.query).toBe('');
  expect(result.habilidades.tecnicas).toEqual([
    { item: 'React', nivel: 'intermedio' },
  ]);
});

test('convierte ambos tipos de experiencia en laboral y academica', () => {
  const result = applyGlobalSuggestion(filters, {
    type: 'experience',
    value: 'Backend',
    qualifier: 'ambos',
  });

  expect(result.experiencia).toEqual([
    { cargo: 'Backend', tipos: ['laboral', 'academica'] },
  ]);
});
