const addUniqueValue = (values, value) => (
  values.some((item) => item.toLowerCase() === value.toLowerCase()) ? values : [...values, value]
);

export const applyGlobalSuggestion = (filters, { type, value, qualifier }) => {
  const next = JSON.parse(JSON.stringify(filters));

  if (type === 'name') {
    const words = next.usuario.nombre.trim().split(/\s+/).filter(Boolean);
    next.usuario.nombre = addUniqueValue(words, value).join(' ');
  } else if (type === 'city') {
    next.usuario.ciudad = addUniqueValue(next.usuario.ciudad, value);
  } else if (type === 'country') {
    next.usuario.pais = addUniqueValue(next.usuario.pais, value);
  } else if (type === 'profession') {
    next.usuario.profesion = addUniqueValue(next.usuario.profesion, value);
  } else if (type === 'technicalSkill' || type === 'softSkill') {
    const skillType = type === 'technicalSkill' ? 'tecnicas' : 'blandas';
    next.habilidades[skillType] = [
      ...next.habilidades[skillType].filter((skill) => skill.item.toLowerCase() !== value.toLowerCase()),
      { item: value, nivel: qualifier },
    ];
  } else if (type === 'experience') {
    next.experiencia = [
      ...next.experiencia.filter((experience) => experience.cargo.toLowerCase() !== value.toLowerCase()),
      { cargo: value, tipos: qualifier === 'ambos' ? ['laboral', 'academica'] : [qualifier] },
    ];
  } else if (type === 'technology') {
    next.proyectos.tecnologias = addUniqueValue(next.proyectos.tecnologias, value);
  } else if (type === 'projectType') {
    next.proyectos.tipo = addUniqueValue(next.proyectos.tipo, value);
  }

  next.query = '';
  return next;
};
