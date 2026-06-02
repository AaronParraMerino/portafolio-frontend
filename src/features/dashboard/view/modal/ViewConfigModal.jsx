// src/features/dashboard/view/modal/ViewConfigModal.jsx

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import { useLanguage } from '../../../../core/i18n';

import {
  ACCENT_COLORS,
  AVATAR_COLORS,
  CARD_COLORS,
  DEFAULT_CONFIG,
  FONTS,
  FRAMES,
  HERO_COLORS,
  PATTERNS,
  TEXT_COLORS,
  isVisible,
} from '../model/viewModel';

function Swatch({ color, active, onClick, label }) {
  return (
    <button
      type="button"
      className={`swatch ${active ? 'active' : ''}`}
      style={{ background: color }}
      onClick={onClick}
      title={color}
      aria-label={label}
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
  t,
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
              ? t('view.config.visibility.showResults', { count: filteredItems.length })
              : t('view.config.visibility.showAll')}
          </span>
        </label>

        <div className="vis-divider" />

        {filteredItems.length === 0 && (
          <div className="vis-empty">
            {t('view.config.visibility.noResults')}
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
                  {item.type === 'tec' ? t('view.type.technical') : t('view.type.soft')}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function cloneConfig(config = DEFAULT_CONFIG) {
  return JSON.parse(JSON.stringify(config || DEFAULT_CONFIG));
}

function configsEqual(left, right) {
  return JSON.stringify(left || {}) === JSON.stringify(right || {});
}

function idsToVisible(items = []) {
  return items.reduce((acc, item) => ({
    ...acc,
    [item.id]: true,
  }), {});
}

function buildAllVisibleVisibility(visibilityItems = {}) {
  return {
    perfil: idsToVisible(visibilityItems.perfil),
    stats: idsToVisible(visibilityItems.stats),
    habilidades: idsToVisible(visibilityItems.habilidades),
    experiencias: idsToVisible(visibilityItems.experiencias),
    proyectos: idsToVisible(visibilityItems.proyectos),
    proyecto_detalles: idsToVisible(visibilityItems.proyecto_detalles),
  };
}

export default function ViewConfigModal({
  open,
  config,
  data,
  onSave,
  saving = false,
  onClose,
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('apariencia');
  const [resetOpen, setResetOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [draftConfig, setDraftConfig] = useState(() => cloneConfig(config));
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }

    if (wasOpen.current) return;

    setDraftConfig(cloneConfig(config));
    setResetOpen(false);
    setDiscardOpen(false);
    setSaveConfirmOpen(false);
    setSaveError('');
    wasOpen.current = true;
  }, [open, config]);

  const safeConfig = draftConfig || {};
  const safeVisibility = safeConfig.visibilidad || {};
  const hasUnsavedChanges = !configsEqual(draftConfig, config || {});

  const visibilityItems = useMemo(() => {
    const habilidadesTec = data?.habilidades?.tecnicas || [];
    const habilidadesSoft = data?.habilidades?.blandas || [];

    return {
      perfil: [
        {
          id: 'nombre',
          label: t('view.config.visibility.profile.name'),
          sub: `${data?.perfil?.nombre || ''} ${data?.perfil?.apellido || ''}`.trim(),
        },
        {
          id: 'profesion',
          label: t('view.config.visibility.profile.profession'),
          sub: data?.perfil?.profesion,
        },
        {
          id: 'ubicacion',
          label: t('view.config.visibility.profile.location'),
          sub: `${data?.perfil?.ciudad || ''}, ${data?.perfil?.pais || ''}`,
        },
        {
          id: 'telefono',
          label: t('view.config.visibility.profile.phone'),
          sub: data?.perfil?.telefono,
        },
        {
          id: 'correo',
          label: t('view.config.visibility.profile.email'),
          sub: data?.perfil?.correo,
        },
        {
          id: 'redes',
          label: t('view.config.visibility.profile.social'),
          sub: `${data?.redes?.length || 0} enlaces`,
        },
        {
          id: 'biografia',
          label: t('view.config.visibility.profile.about'),
          sub: t('view.config.visibility.profile.publicBio'),
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

      proyecto_detalles: [
        { id: 'media', label: t('view.config.visibility.projectDetails.media'), sub: t('view.config.visibility.projectDetails.mediaSub') },
        { id: 'estado', label: t('view.config.visibility.projectDetails.status'), sub: t('view.config.visibility.projectDetails.statusSub') },
        { id: 'tipo', label: t('view.config.visibility.projectDetails.type'), sub: t('view.config.visibility.projectDetails.typeSub') },
        { id: 'descripcion', label: t('view.config.visibility.projectDetails.description'), sub: t('view.config.visibility.projectDetails.descriptionSub') },
        { id: 'tecnologias', label: t('view.config.visibility.projectDetails.technologies'), sub: t('view.config.visibility.projectDetails.technologiesSub') },
        { id: 'repositorios', label: t('view.config.visibility.projectDetails.repositories'), sub: t('view.config.visibility.projectDetails.repositoriesSub') },
        { id: 'demo', label: t('view.config.visibility.projectDetails.demo'), sub: t('view.config.visibility.projectDetails.demoSub') },
        { id: 'videos', label: t('view.config.visibility.projectDetails.videos'), sub: t('view.config.visibility.projectDetails.videosSub') },
        { id: 'documentos', label: t('view.config.visibility.projectDetails.documents'), sub: t('view.config.visibility.projectDetails.documentsSub') },
        { id: 'fechas', label: t('view.config.visibility.projectDetails.dates'), sub: t('view.config.visibility.projectDetails.datesSub') },
        { id: 'rol', label: t('view.config.visibility.projectDetails.role'), sub: t('view.config.visibility.projectDetails.roleSub') },
        { id: 'aporte', label: t('view.config.visibility.projectDetails.contribution'), sub: t('view.config.visibility.projectDetails.contributionSub') },
        { id: 'participantes', label: t('view.config.visibility.projectDetails.participants'), sub: t('view.config.visibility.projectDetails.participantsSub') },
      ],
    };
  }, [data, t]);

  const allVisibleVisibility = useMemo(
    () => buildAllVisibleVisibility(visibilityItems),
    [visibilityItems]
  );

  const patchConfig = (patch) => {
    setSaveError('');
    setDraftConfig(prev => ({
      ...prev,
      ...patch,
      visibilidad: patch.visibilidad ?? prev.visibilidad,
    }));
  };

  if (!open) return null;

  const requestClose = () => {
    if (saving) return;

    if (hasUnsavedChanges) {
      setDiscardOpen(true);
      return;
    }

    onClose();
  };

  const handleToggleVisibility = (group, id, value) => {
    const nextVisibility = {
      ...safeVisibility,
      [group]: {
        ...(safeVisibility[group] || {}),
        [id]: value,
      },
    };

    patchConfig({ visibilidad: nextVisibility });
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

    patchConfig({ visibilidad: nextVisibility });
  };

  const requestSave = () => {
    setSaveError('');
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (onSave) {
        await onSave(draftConfig);
      }

      setSaveConfirmOpen(false);
      setSaveError('');
      onClose();
    } catch (error) {
      setSaveConfirmOpen(false);
      setSaveError(error?.message || t('view.config.error.save'));
    }
  };

  const modalContent = (
    <>
      <div
        className="cfg-overlay open"
        onClick={event => {
          if (event.target === event.currentTarget) {
            requestClose();
          }
        }}
      >
        <div
          className="cfg-drawer open"
          role="dialog"
          aria-modal="true"
          aria-label={t('view.config.title')}
        >
          <div className="cfg-head">
            <div>
              <div className="cfg-head-title">{t('view.config.title')}</div>
              <div className="cfg-head-sub">
                {t('view.config.subtitle')}
              </div>
            </div>

            <button
              type="button"
              className="cfg-close"
              onClick={requestClose}
              aria-label={t('actions.close')}
              disabled={saving}
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
              {t('view.config.tabs.appearance')}
            </button>

            <button
              type="button"
              className={`cfg-tab ${tab === 'visibilidad' ? 'active' : ''}`}
              onClick={() => setTab('visibilidad')}
            >
              {t('view.config.tabs.visibility')}
            </button>
          </div>

          <div className="cfg-body">
            {tab === 'apariencia' && (
            <div className="cfg-tab-panel active">
                <div className="cfg-grid">
                {/* BANNER */}
                <div className="cfg-section full">
                    <SectionHead
                    title={t('view.config.banner.title')}
                    sub={t('view.config.banner.subtitle')}
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <rect x="1" y="1" width="12" height="8" rx="2" />
                        <path d="M1 6l3-2 3 2 3-3 3 3" />
                        </svg>
                    )}
                    />

                    <SourceToggle
                    value={safeConfig.heroBgSource || 'custom'}
                    onChange={value => patchConfig({ heroBgSource: value })}
                    leftLabel={t('view.config.source.banner')}
                    rightLabel={t('view.config.source.customize')}
                    />

                    <div className={`cfg-block ${safeConfig.heroBgSource === 'foto' ? 'disabled' : ''}`}>
                    <MiniLabel>{t('view.config.backgroundColor')}</MiniLabel>

                    <div className="swatch-row cfg-space-bottom">
                        {HERO_COLORS.map(color => (
                        <Swatch
                            key={color}
                            color={color}
                            active={safeConfig.heroColor === color}
                            onClick={() => patchConfig({ heroColor: color })}
                            label={t('view.config.selectColor', { color })}
                        />
                        ))}
                    </div>

                    <MiniLabel>{t('view.config.pattern')}</MiniLabel>

                    <div className="pattern-options">
                        {PATTERNS.map(pattern => (
                        <PatternButton
                            key={pattern.id}
                            pattern={{ ...pattern, label: t(`view.pattern.${pattern.id}`) }}
                            active={safeConfig.heroPattern === pattern.id}
                            onClick={() => patchConfig({ heroPattern: pattern.id })}
                        />
                        ))}
                    </div>
                    </div>
                </div>

                {/* AVATAR */}
                <div className="cfg-section">
                    <SectionHead
                    title={t('view.config.avatar.title')}
                    sub={t('view.config.avatar.subtitle')}
                    icon={(
                        <svg viewBox="0 0 14 14">
                        <circle cx="7" cy="5" r="2.5" />
                        <path d="M2 12c0-3 2.5-4.5 5-4.5s5 1.5 5 4.5" />
                        </svg>
                    )}
                    />

                    <SourceToggle
                    value={safeConfig.avatarBgSource || 'custom'}
                    onChange={value => patchConfig({ avatarBgSource: value })}
                    leftLabel={t('view.config.source.avatar')}
                    rightLabel={t('view.config.source.customize')}
                    />

                    <div className={`cfg-block ${safeConfig.avatarBgSource === 'foto' ? 'disabled' : ''}`}>
                    <div className="swatch-row">
                        {AVATAR_COLORS.map(color => (
                        <Swatch
                            key={color}
                            color={color}
                            active={safeConfig.avatarColor === color}
                            onClick={() => patchConfig({ avatarColor: color })}
                            label={t('view.config.selectColor', { color })}
                        />
                        ))}
                    </div>
                    </div>
                </div>

                {/* ACENTO */}
                <div className="cfg-section">
                    <SectionHead
                    title={t('view.config.accent.title')}
                    sub={t('view.config.accent.subtitle')}
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
                        active={safeConfig.accentColor === color}
                        onClick={() => patchConfig({ accentColor: color })}
                        label={t('view.config.selectColor', { color })}
                        />
                    ))}
                    </div>
                </div>

                {/* FONDO */}
                <div className="cfg-section full">
                    <SectionHead
                    title={t('view.config.card.title')}
                    sub={t('view.config.card.subtitle')}
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
                        active={safeConfig.cardBg === color}
                        onClick={() => patchConfig({ cardBg: color })}
                        label={t('view.config.selectColor', { color })}
                        />
                    ))}
                    </div>
                </div>

                {/* COLOR DE TEXTO */}
                <div className="cfg-section full">
                <SectionHead
                    title={t('view.config.text.title')}
                    sub={t('view.config.text.subtitle')}
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
                        {t('view.config.text.auto')}
                    </div>

                    <div className="cfg-toggle-sub">
                        {t('view.config.text.autoHelp')}
                    </div>
                    </div>

                    <button
                    type="button"
                    className={`cfg-toggle ${safeConfig.textColorAuto ? '' : 'off'}`}
                    onClick={() => patchConfig({ textColorAuto: !safeConfig.textColorAuto })}
                    aria-label={t('view.config.text.autoAria')}
                    />
                </div>

                <div className={`cfg-block ${safeConfig.textColorAuto ? 'disabled' : ''}`}>
                    <MiniLabel space>{t('view.config.text.custom')}</MiniLabel>

                    <div className="swatch-row">
                    {TEXT_COLORS.map(color => (
                        <Swatch
                        key={color}
                        color={color}
                        active={(safeConfig.textColor || '#111827') === color}
                        onClick={() => patchConfig({ textColor: color })}
                        label={t('view.config.selectColor', { color })}
                        />
                    ))}
                    </div>
                </div>
                </div>

                {/* TIPOGRAFÍA */}
                <div className="cfg-section full">
                    <SectionHead
                    title={t('view.config.font.title')}
                    sub={t('view.config.font.subtitle')}
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
                        font={{ ...font, preview: t(`view.font.${font.id}.preview`) }}
                        active={(safeConfig.fontId || 'inter') === font.id}
                        onClick={() => patchConfig({ fontId: font.id })}
                        />
                    ))}
                    </div>
                </div>

                {/* MARCO */}
                <div className="cfg-section full">
                    <SectionHead
                    title={t('view.config.frame.title')}
                    sub={t('view.config.frame.subtitle')}
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
                        className={`border-opt ${safeConfig.frameId === frame.id ? 'active' : ''}`}
                        onClick={() => patchConfig({ frameId: frame.id })}
                        >
                        <FramePreview frameId={frame.id} />
                        <span className="border-opt-label">{t(`view.frame.${frame.id}`)}</span>
                        </button>
                    ))}
                    </div>
                </div>

                {/* DISPONIBILIDAD */}
                <div className="cfg-section full">
                    <SectionHead
                    title={t('view.config.availability.title')}
                    sub={t('view.config.availability.subtitle')}
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
                        {t('view.identity.available')}
                        </div>

                        <div className="cfg-toggle-sub">
                        {t('view.config.availability.help')}
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`cfg-toggle ${safeConfig.disponible ? '' : 'off'}`}
                        onClick={() => patchConfig({ disponible: !safeConfig.disponible })}
                        aria-label={t('view.config.availability.aria')}
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
                    {t('view.config.visibility.intro')}
                  </p>

                  <VisibilityGroup
                    title={t('view.config.visibility.groups.profile')}
                    group="perfil"
                    items={visibilityItems.perfil}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    defaultOpen
                    t={t}
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <circle cx="7" cy="5" r="2.5" />
                        <path d="M2 12c0-3 2.5-4.5 5-4.5s5 1.5 5 4.5" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title={t('view.config.visibility.groups.stats')}
                    group="stats"
                    items={visibilityItems.stats}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    t={t}
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <path d="M2 12V7M7 12V3M12 12V5" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title={t('view.config.visibility.groups.skills')}
                    group="habilidades"
                    items={visibilityItems.habilidades}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    searchable
                    t={t}
                    searchPlaceholder={t('view.config.visibility.searchSkill')}
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <path d="M2 10l3-6 3 6 3-6 1 6" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title={t('view.config.visibility.groups.experience')}
                    group="experiencias"
                    items={visibilityItems.experiencias}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    searchable
                    t={t}
                    searchPlaceholder={t('view.config.visibility.searchExperience')}
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <rect x="2" y="4" width="10" height="8" rx="1.5" />
                        <path d="M5 4V2.8h4V4" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title={t('view.config.visibility.groups.projects')}
                    group="proyectos"
                    items={visibilityItems.proyectos}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    searchable
                    t={t}
                    searchPlaceholder={t('view.config.visibility.searchProject')}
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <rect x="2" y="2" width="10" height="10" rx="2" />
                        <path d="M4 5h6M4 8h4" />
                      </svg>
                    )}
                  />

                  <VisibilityGroup
                    title={t('view.config.visibility.groups.projectDetails')}
                    group="proyecto_detalles"
                    items={visibilityItems.proyecto_detalles}
                    config={safeConfig}
                    onToggle={handleToggleVisibility}
                    onToggleMany={handleToggleManyVisibility}
                    defaultOpen
                    t={t}
                    icon={(
                      <svg viewBox="0 0 14 14">
                        <rect x="2" y="2" width="10" height="10" rx="2" />
                        <path d="M5 5h4M5 7h4M5 9h2" />
                      </svg>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="cfg-foot">
            {saveError && (
              <div
                className="cfg-save-error"
                role="alert"
              >
                {saveError}
              </div>
            )}

            <button
              type="button"
              className="cfg-btn-cancel"
              onClick={() => setResetOpen(true)}
              disabled={saving}
            >
              {t('view.config.restore')}
            </button>

            <button
              type="button"
              className="cfg-btn-save"
              onClick={requestSave}
              disabled={saving}
            >
              {saving ? t('actions.saving') : t('view.config.applyChanges')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={resetOpen}
        variant="yellow"
        icon="warning"
        title={t('view.config.restoreTitle')}
        subtitle={t('view.config.restoreSubtitle')}
        message={t('view.config.restoreMessage')}
        confirmLabel={t('view.config.restore')}
        cancelLabel={t('actions.cancel')}
        onConfirm={() => {
          setDraftConfig(cloneConfig({
            ...DEFAULT_CONFIG,
            visibilidad: allVisibleVisibility,
          }));
          setResetOpen(false);
        }}
        onClose={() => setResetOpen(false)}
      />

      <ConfirmModal
        open={saveConfirmOpen}
        variant="green"
        icon="check"
        title={t('view.config.applyChanges')}
        subtitle={t('view.config.saveSubtitle')}
        message={
          hasUnsavedChanges
            ? t('view.config.saveMessage')
            : t('view.config.noChangesMessage')
        }
        confirmLabel={t('actions.saveConfirm')}
        cancelLabel={t('actions.cancel')}
        loading={saving}
        onConfirm={handleConfirmSave}
        onClose={() => !saving && setSaveConfirmOpen(false)}
      />

      <ConfirmModal
        open={discardOpen}
        variant="yellow"
        icon="warning"
        title={t('view.config.discardTitle')}
        subtitle={t('view.config.discardSubtitle')}
        message={t('view.config.discardMessage')}
        confirmLabel={t('view.config.discardConfirm')}
        cancelLabel={t('view.config.keepEditing')}
        onConfirm={() => {
          setDiscardOpen(false);
          setDraftConfig(cloneConfig(config));
          onClose();
        }}
        onClose={() => setDiscardOpen(false)}
      />
    </>
  );

  return createPortal(modalContent, document.body);
}
