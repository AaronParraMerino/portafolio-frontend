// src/features/dashboard/view/modal/ViewConfigModal.jsx

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';

import {
  ACCENT_COLORS,
  AVATAR_COLORS,
  CARD_COLORS,
  FONTS,
  FRAMES,
  HERO_COLORS,
  PATTERNS,
  TEXT_COLORS,
  isVisible,
} from '../model/viewModel';

function Swatch({ color, active, onClick }) {
  return (
    <button
      type="button"
      className={`swatch ${active ? 'active' : ''}`}
      style={{ background: color }}
      onClick={onClick}
      title={color}
      aria-label={`Seleccionar color ${color}`}
    />
  );
}

function SectionHead({ icon, title, sub }) {
  return (
    <div className="cfg-section-head">
      <div className="cfg-section-icon">{icon}</div>

      <div>
        <div className="cfg-section-title">{title}</div>
        <div className="cfg-section-sub">{sub}</div>
      </div>
    </div>
  );
}

function SourceToggle({
  value,
  onChange,
  leftLabel = 'Foto de perfil',
  rightLabel = 'Personalizar',
}) {
  return (
    <div className="src-toggle">
      <button
        type="button"
        className={`src-btn ${value === 'foto' ? 'active' : ''}`}
        onClick={() => onChange('foto')}
      >
        <svg viewBox="0 0 14 14">
          <rect x="1" y="2" width="12" height="10" rx="2" />
          <circle cx="7" cy="7" r="2.5" />
        </svg>
        {leftLabel}
      </button>

      <button
        type="button"
        className={`src-btn ${value === 'custom' ? 'active' : ''}`}
        onClick={() => onChange('custom')}
      >
        <svg viewBox="0 0 14 14">
          <circle cx="4" cy="4" r="1.5" />
          <path d="M1 10l3-3 2 2 3-4 4 5" />
        </svg>
        {rightLabel}
      </button>
    </div>
  );
}

function MiniLabel({ children, space = false }) {
  return (
    <div className={`cfg-mini-label ${space ? 'cfg-mini-label-space' : ''}`}>
      {children}
    </div>
  );
}

function PatternButton({ pattern, active, onClick }) {
  return (
    <button
      type="button"
      className={`pattern-opt pattern-${pattern.id} ${active ? 'active' : ''}`}
      onClick={onClick}
      title={pattern.label}
    >
      <span>{pattern.label}</span>
    </button>
  );
}

function FontOption({ font, active, onClick }) {
  return (
    <button
      type="button"
      className={`font-opt ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div>
        <div
          className="font-opt-name"
          style={{ fontFamily: font.value }}
        >
          {font.label}
        </div>

        <div className="font-opt-preview">
          {font.preview}
        </div>
      </div>

      <div className="font-opt-check" />
    </button>
  );
}

function FramePreview({ frameId }) {
  if (frameId === 'mac') {
    return (
      <div className="frame-mini frame-mini-mac">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (frameId === 'linux') {
    return (
      <div className="frame-mini frame-mini-linux">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (frameId === 'windows') {
    return (
      <div className="frame-mini frame-mini-windows">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (frameId === 'thick') {
    return <div className="frame-mini frame-mini-thick" />;
  }

  return <div className="frame-mini frame-mini-none" />;
}

function normalizeText(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function VisibilityGroup({
  title,
  icon,
  group,
  items = [],
  config,
  onToggle,
  onToggleMany,
  defaultOpen = false,
  searchable = false,
  searchPlaceholder = 'Buscar...',
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    const term = normalizeText(search);

    if (!term) return items;

    return items.filter(item => {
      const haystack = normalizeText(
        `${item.label || ''} ${item.sub || ''} ${item.type || ''}`
      );

      return haystack.includes(term);
    });
  }, [items, search]);

  const visibleCount = items.filter(item =>
    isVisible(config?.visibilidad, group, item.id)
  ).length;

  const filteredVisibleCount = filteredItems.filter(item =>
    isVisible(config?.visibilidad, group, item.id)
  ).length;

  const allFilteredVisible =
    filteredItems.length > 0 &&
    filteredVisibleCount === filteredItems.length;

  const handleToggleFiltered = () => {
    if (!filteredItems.length) return;

    const nextValue = !allFilteredVisible;
    const ids = filteredItems.map(item => item.id);

    onToggleMany(group, ids, nextValue);
  };

  return (
    <div className={`vis-group ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="vis-group-header"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="vis-group-icon">
          {icon}
        </div>

        <div className="vis-group-title">
          {title}
        </div>

        <div className="vis-group-count">
          {visibleCount}/{items.length}
        </div>

        <svg className="vis-arrow" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      <div className="vis-group-body">
        {searchable && (
          <input
            type="search"
            className="vis-search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        )}

        <label className="vis-item vis-select-all">
          <input
            type="checkbox"
            checked={allFilteredVisible}
            disabled={filteredItems.length === 0}
            onChange={handleToggleFiltered}
          />

          <span className="vis-item-label">
            {searchable && search.trim()
              ? `Mostrar resultados encontrados (${filteredItems.length})`
              : 'Mostrar todo'}
          </span>
        </label>

        <div className="vis-divider" />

        {filteredItems.length === 0 && (
          <div className="vis-empty">
            No se encontraron resultados.
          </div>
        )}

        {filteredItems.map(item => {
          const checked = isVisible(config?.visibilidad, group, item.id);

          return (
            <label key={item.id} className="vis-item">
              <input
                type="checkbox"
                checked={checked}
                onChange={event =>
                  onToggle(group, item.id, event.target.checked)
                }
              />

              <span className="vis-item-label">
                {item.label}

                {item.sub && (
                  <span className="vis-item-sub">
                    {item.sub}
                  </span>
                )}
              </span>

              {item.type && (
                <span className={`vis-item-type vis-type-${item.type}`}>
                  {item.type === 'tec' ? 'Técnica' : 'Blanda'}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function ViewConfigModal({
  open,
  config,
  data,
  onChange,
  onReset,
  onSave,
  saving = false,
  onClose,
}) {
  const [tab, setTab] = useState('apariencia');
  const [resetOpen, setResetOpen] = useState(false);

  const safeConfig = config || {};
  const safeVisibility = safeConfig.visibilidad || {};

  const visibilityItems = useMemo(() => {
    const habilidadesTec = data?.habilidades?.tecnicas || [];
    const habilidadesSoft = data?.habilidades?.blandas || [];

    return {
      perfil: [
        {
          id: 'nombre',
          label: 'Nombre completo',
          sub: `${data?.perfil?.nombre || ''} ${data?.perfil?.apellido || ''}`.trim(),
        },
        {
          id: 'profesion',
          label: 'Profesión',
          sub: data?.perfil?.profesion,
        },
        {
          id: 'ubicacion',
          label: 'Ubicación',
          sub: `${data?.perfil?.ciudad || ''}, ${data?.perfil?.pais || ''}`,
        },
        {
          id: 'telefono',
          label: 'Teléfono',
          sub: data?.perfil?.telefono,
        },
        {
          id: 'correo',
          label: 'Correo electrónico',
          sub: data?.perfil?.correo,
        },
        {
          id: 'redes',
          label: 'Redes sociales',
          sub: `${data?.redes?.length || 0} enlaces`,
        },
        {
          id: 'biografia',
          label: 'Acerca de mí',
          sub: 'Biografía pública',
        },
      ],

      stats: (data?.stats || []).map(stat => ({
        id: stat.id,
        label: stat.label,
        sub: stat.valor,
      })),

      habilidades: [
        ...habilidadesTec.map(skill => ({
          id: skill.id,
          label: skill.nombre,
          sub: `${skill.nivel} · ${skill.porcentaje}%`,
          type: 'tec',
        })),
        ...habilidadesSoft.map(skill => ({
          id: skill.id,
          label: skill.nombre,
          sub: `${skill.nivel} · ${skill.porcentaje}%`,
          type: 'soft',
        })),
      ],

      experiencias: (data?.experiencias || []).map(exp => ({
        id: exp.id,
        label: exp.cargo,
        sub: exp.organizacion,
      })),

      proyectos: (data?.proyectos || []).map(proyecto => ({
        id: proyecto.id,
        label: proyecto.titulo,
        sub: `${proyecto.tipo} · ${proyecto.anio}`,
      })),
    };
  }, [data]);

  if (!open) return null;

  const handleToggleVisibility = (group, id, value) => {
    const nextVisibility = {
      ...safeVisibility,
      [group]: {
        ...(safeVisibility[group] || {}),
        [id]: value,
      },
    };

    onChange({ visibilidad: nextVisibility });
  };

  const handleToggleManyVisibility = (group, ids, value) => {
    const currentGroup = safeVisibility[group] || {};

    const nextGroup = {
      ...currentGroup,
    };

    ids.forEach(id => {
      nextGroup[id] = value;
    });

    const nextVisibility = {
      ...safeVisibility,
      [group]: nextGroup,
    };

    onChange({ visibilidad: nextVisibility });
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave();
      }

      onClose();
    } catch {
      // El hook muestra el toast de error y el modal queda abierto.
    }
  };

  const modalContent = (
    <>
      <div
        className="cfg-overlay open"
        onClick={event => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="cfg-drawer open"
          role="dialog"
          aria-modal="true"
          aria-label="Editar portafolio"
        >
          <div className="cfg-head">
            <div>
              <div className="cfg-head-title">Editar portafolio</div>
              <div className="cfg-head-sub">
                Apariencia y visibilidad de tu vista pública
              </div>
            </div>

            <button
              type="button"
              className="cfg-close"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <svg viewBox="0 0 11 11">
                <path d="M1 1l9 9M10 1L1 10" />
              </svg>
            </button>
          </div>

          <div className="cfg-head-divider" />

          <div className="cfg-tabs">
            <button
              type="button"
              className={`cfg-tab ${tab === 'apariencia' ? 'active' : ''}`}
              onClick={() => setTab('apariencia')}
            >
              Apariencia
            </button>

            <button
              type="button"
              className={`cfg-tab ${tab === 'visibilidad' ? 'active' : ''}`}
              onClick={() => setTab('visibilidad')}
            >
              Visibilidad
            </button>
          </div>

          <div className="cfg-body">
            {tab === 'apariencia' && (
            <div className="cfg-tab-panel active">
                <div className="cfg-grid">
                {/* BANNER */}
                <div className="cfg-section full">
                    <SectionHead
                    title="Banner"
                    sub="Foto de Mi Perfil o colores personalizados"
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <rect x="1" y="1" width="12" height="8" rx="2" />
                        <path d="M1 6l3-2 3 2 3-3 3 3" />
                        </svg>
                    )}
                    />

                    <SourceToggle
                    value={config.heroBgSource || 'custom'}
                    onChange={value => onChange({ heroBgSource: value })}
                    leftLabel="Usar banner"
                    rightLabel="Personalizar"
                    />

                    <div className={`cfg-block ${config.heroBgSource === 'foto' ? 'disabled' : ''}`}>
                    <MiniLabel>Color de fondo</MiniLabel>

                    <div className="swatch-row cfg-space-bottom">
                        {HERO_COLORS.map(color => (
                        <Swatch
                            key={color}
                            color={color}
                            active={config.heroColor === color}
                            onClick={() => onChange({ heroColor: color })}
                        />
                        ))}
                    </div>

                    <MiniLabel>Patrón</MiniLabel>

                    <div className="pattern-options">
                        {PATTERNS.map(pattern => (
                        <PatternButton
                            key={pattern.id}
                            pattern={pattern}
                            active={config.heroPattern === pattern.id}
                            onClick={() => onChange({ heroPattern: pattern.id })}
                        />
                        ))}
                    </div>
                    </div>
                </div>

                {/* AVATAR */}
                <div className="cfg-section">
                    <SectionHead
                    title="Avatar"
                    sub="Foto o color de fondo"
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <circle cx="7" cy="5" r="2.5" />
                        <path d="M2 12c0-3 2.5-4.5 5-4.5s5 1.5 5 4.5" />
                        </svg>
                    )}
                    />

                    <SourceToggle
                    value={config.avatarBgSource || 'custom'}
                    onChange={value => onChange({ avatarBgSource: value })}
                    leftLabel="Usar avatar"
                    rightLabel="Personalizar"
                    />

                    <div className={`cfg-block ${config.avatarBgSource === 'foto' ? 'disabled' : ''}`}>
                    <div className="swatch-row">
                        {AVATAR_COLORS.map(color => (
                        <Swatch
                            key={color}
                            color={color}
                            active={config.avatarColor === color}
                            onClick={() => onChange({ avatarColor: color })}
                        />
                        ))}
                    </div>
                    </div>
                </div>

                {/* ACENTO */}
                <div className="cfg-section">
                    <SectionHead
                    title="Color de acento"
                    sub="Barras, panel izquierdo, botones y énfasis"
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <path d="M7 1l1.5 4H13l-3.5 2.5 1.3 4L7 9 3.2 11.5l1.3-4L1 5h4.5z" />
                        </svg>
                    )}
                    />

                    <div className="swatch-row">
                    {ACCENT_COLORS.map(color => (
                        <Swatch
                        key={color}
                        color={color}
                        active={config.accentColor === color}
                        onClick={() => onChange({ accentColor: color })}
                        />
                    ))}
                    </div>
                </div>

                {/* FONDO */}
                <div className="cfg-section full">
                    <SectionHead
                    title="Fondo del portafolio"
                    sub="Color de fondo de la tarjeta"
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <rect x="1" y="1" width="12" height="12" rx="2" />
                        <path d="M1 5h12" />
                        </svg>
                    )}
                    />

                    <div className="swatch-row">
                    {CARD_COLORS.map(color => (
                        <Swatch
                        key={color}
                        color={color}
                        active={config.cardBg === color}
                        onClick={() => onChange({ cardBg: color })}
                        />
                    ))}
                    </div>
                </div>

                {/* COLOR DE TEXTO */}
                <div className="cfg-section full">
                <SectionHead
                    title="Color de texto"
                    sub="Automático según fondo o color personalizado"
                    icon={(
                    <svg viewBox="0 0 14 14">
                        <path d="M3 11h8" />
                        <path d="M5 11l2-8 2 8" />
                        <path d="M5.7 8h2.6" />
                    </svg>
                    )}
                />

                <div className="cfg-toggle-row cfg-toggle-row-spaced">
                    <div>
                    <div className="cfg-toggle-label">
                        Cambio automático de texto
                    </div>

                    <div className="cfg-toggle-sub">
                        Ajusta el texto a claro u oscuro según el fondo del portafolio
                    </div>
                    </div>

                    <button
                    type="button"
                    className={`cfg-toggle ${config.textColorAuto ? '' : 'off'}`}
                    onClick={() => onChange({ textColorAuto: !config.textColorAuto })}
                    aria-label="Cambiar modo automático del color de texto"
                    />
                </div>

                <div className={`cfg-block ${config.textColorAuto ? 'disabled' : ''}`}>
                    <MiniLabel space>Color personalizado</MiniLabel>

                    <div className="swatch-row">
                    {TEXT_COLORS.map(color => (
                        <Swatch
                        key={color}
                        color={color}
                        active={(config.textColor || '#111827') === color}
                        onClick={() => onChange({ textColor: color })}
                        />
                    ))}
                    </div>
                </div>
                </div>

                {/* TIPOGRAFÍA */}
                <div className="cfg-section full">
                    <SectionHead
                    title="Tipografía"
                    sub="Fuente principal del portafolio"
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <path d="M2 3h10M7 3v8M4 11h6" />
                        </svg>
                    )}
                    />

                    <div className="font-options">
                    {FONTS.map(font => (
                        <FontOption
                        key={font.id}
                        font={font}
                        active={(config.fontId || 'inter') === font.id}
                        onClick={() => onChange({ fontId: font.id })}
                        />
                    ))}
                    </div>
                </div>

                {/* MARCO */}
                <div className="cfg-section full">
                    <SectionHead
                    title="Marco"
                    sub="Estilo visual de la ventana del portafolio"
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <rect x="1.5" y="2" width="11" height="10" rx="1.5" />
                        <path d="M1.5 5h11" />
                        </svg>
                    )}
                    />

                    <div className="border-options">
                    {FRAMES.map(frame => (
                        <button
                        key={frame.id}
                        type="button"
                        className={`border-opt ${config.frameId === frame.id ? 'active' : ''}`}
                        onClick={() => onChange({ frameId: frame.id })}
                        >
                        <FramePreview frameId={frame.id} />
                        <span className="border-opt-label">{frame.label}</span>
                        </button>
                    ))}
                    </div>
                </div>

                {/* DISPONIBILIDAD */}
                <div className="cfg-section full">
                    <SectionHead
                    title="Disponibilidad"
                    sub="Badge en tu perfil público"
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <circle cx="7" cy="7" r="5" />
                        <circle cx="7" cy="7" r="2" fill="currentColor" />
                        </svg>
                    )}
                    />

                    <div className="cfg-toggle-row">
                    <div>
                        <div className="cfg-toggle-label">
                        Disponible para proyectos
                        </div>

                        <div className="cfg-toggle-sub">
                        Visible para reclutadores
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`cfg-toggle ${config.disponible ? '' : 'off'}`}
                        onClick={() => onChange({ disponible: !config.disponible })}
                        aria-label="Cambiar disponibilidad"
                    />
                    </div>
                </div>
                </div>
            </div>
            )}
            {tab === 'visibilidad' && (
              <div className="cfg-tab-panel active">
                <div className="cfg-section full">
                  <p className="vis-intro">
                    Elige qué información se mostrará en la vista pública de tu
                    portafolio. Los cambios se aplican inmediatamente sobre la
                    previsualización.
                  </p>

                  <VisibilityGroup
                    title="Perfil"
                    group="perfil"
                    items={visibilityItems.perfil}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    defaultOpen
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <circle cx="7" cy="5" r="2.5" />
                        <path d="M2 12c0-3 2.5-4.5 5-4.5s5 1.5 5 4.5" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title="Estadísticas"
                    group="stats"
                    items={visibilityItems.stats}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <path d="M2 12V7M7 12V3M12 12V5" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title="Habilidades"
                    group="habilidades"
                    items={visibilityItems.habilidades}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    searchable
                    searchPlaceholder="Buscar habilidad..."
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <path d="M2 10l3-6 3 6 3-6 1 6" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title="Experiencia"
                    group="experiencias"
                    items={visibilityItems.experiencias}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    searchable
                    searchPlaceholder="Buscar experiencia..."
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <rect x="2" y="4" width="10" height="8" rx="1.5" />
                        <path d="M5 4V2.8h4V4" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title="Proyectos"
                    group="proyectos"
                    items={visibilityItems.proyectos}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    searchable
                    searchPlaceholder="Buscar proyecto..."
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <rect x="2" y="2" width="10" height="10" rx="2" />
                        <path d="M4 5h6M4 8h4" />
                      </svg>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="cfg-foot">
            <button
              type="button"
              className="cfg-btn-cancel"
              onClick={() => setResetOpen(true)}
            >
              Restaurar
            </button>

            <button
              type="button"
              className="cfg-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Aplicar cambios'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={resetOpen}
        variant="yellow"
        icon="warning"
        title="Restaurar configuración"
        subtitle="Volver a los valores mock"
        message="Se restaurarán los colores, el marco, la disponibilidad y la visibilidad inicial del portafolio."
        confirmLabel="Restaurar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          onReset();
          setResetOpen(false);
        }}
        onClose={() => setResetOpen(false)}
      />
    </>
  );

  return createPortal(modalContent, document.body);
}
