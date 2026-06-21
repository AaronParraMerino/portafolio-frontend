import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BsCalendar2Plus,
  BsCheck2,
  BsCodeSlash,
  BsGlobe2,
  BsMortarboard,
  BsPeople,
  BsPersonWorkspace,
  BsBriefcase,
  BsImage,
  BsSearch,
  BsBell,
  BsX,
} from 'react-icons/bs';
import { useLanguage } from '../../../../core/i18n';
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
} from '../../../dashboard/layout/DashboardEdit';
import {
  EVENT_PROFILE_TARGET_GROUPS,
  EVENT_STATUS_FILTERS,
  EVENT_TARGET_MODES,
  EVENT_TYPES,
  EVENT_WEEK_DAYS,
} from '../services/eventsService';

const DEFAULT_FORM = {
  title: '',
  type: 'taller',
  status: 'activo',
  imageFile: null,
  imagePreview: '',
  imageUrl: '',
  startsAt: '',
  endsAt: '',
  activeDays: [...EVENT_WEEK_DAYS],
  sendAt: '',
  sendMode: 'now',
  location: '',
  capacity: '',
  description: '',
  targetMode: 'all_users',
  targetSearches: {
    technicalSkills: '',
    softSkills: '',
    academicExperience: '',
    workExperience: '',
  },
  targetSelections: {
    technicalSkills: [],
    softSkills: [],
    academicExperience: [],
    workExperience: [],
  },
};

const MAX_EVENT_IMAGE_MB = 2;

const TARGET_ICONS = {
  all_users: BsGlobe2,
  segmented: BsPeople,
};

const PROFILE_TARGET_ICONS = {
  technicalSkills: BsCodeSlash,
  softSkills: BsPersonWorkspace,
  academicExperience: BsMortarboard,
  workExperience: BsBriefcase,
};

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateTimeLocalNow() {
  const now = new Date();
  now.setSeconds(0, 0);
  return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
}

function isSameOrBefore(value, reference) {
  const date = toDate(value);
  const referenceDate = toDate(reference);

  return !!date && !!referenceDate && date <= referenceDate;
}

function SingleEventImageUpload({
  imagePreview,
  imageUrl,
  onChange,
  onRemove,
  t,
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const previewSrc = imagePreview || imageUrl;

  const processFile = useCallback((file) => {
    setError('');

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('adminEvents.form.validation.imageType'));
      return;
    }
    if (file.size > MAX_EVENT_IMAGE_MB * 1024 * 1024) {
      setError(t('adminEvents.form.validation.imageSize', { max: MAX_EVENT_IMAGE_MB }));
      return;
    }

    onChange(file);
  }, [onChange, t]);

  return (
    <div className="evt-image-upload">
      {previewSrc ? (
        <div className="evt-image-preview">
          <img src={previewSrc} alt={t('adminEvents.form.previewAlt')} />
          <span className="evt-image-badge">{t('adminEvents.form.cover')}</span>
          <button
            type="button"
            className="evt-image-remove"
            onClick={onRemove}
            title={t('adminEvents.form.removeImage')}
            aria-label={t('adminEvents.form.removeImage')}
          >
            <BsX />
          </button>
        </div>
      ) : (
        <div
          className={`evt-image-dropzone${drag ? ' drag' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDrag(false);
            processFile(event.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
        >
          <div className="evt-image-placeholder">
            <span className="evt-image-icon">
              <BsImage />
            </span>
            <strong>{t('adminEvents.form.dragImage')}</strong>
            <small>{t('adminEvents.form.clickImage', { max: MAX_EVENT_IMAGE_MB })}</small>
          </div>
        </div>
      )}

      {previewSrc ? (
        <button type="button" className="evt-image-change" onClick={() => inputRef.current?.click()}>
          <BsImage />
          {t('adminEvents.form.changeImage')}
        </button>
      ) : null}

      {error ? <div className="evt-modal-message">{error}</div> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={(event) => {
          processFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
}

export default function EventFormModal({
  modal,
  profileTargets,
  profileTargetsLoading = false,
  onClose,
  onSave,
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [message, setMessage] = useState('');
  const objectUrlRef = useRef('');

  useEffect(() => {
    if (!modal) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = '';
      }
      return;
    }

    const event = modal.event || {};
    const editing = modal.mode === 'edit';
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = '';
    }

    setForm({
      title: event.title || '',
      type: event.type || 'taller',
      status: event.status || modal.defaultStatus || 'activo',
      imageFile: null,
      imagePreview: event.imagePreview || '',
      imageUrl: event.imageUrl || event.image_url || event.imagen_url || event.banner_url || '',
      startsAt: event.startsAt || event.fecha_inicio || '',
      endsAt: event.endsAt || event.fecha_fin || '',
      activeDays: editing
        ? toArray(event.activeDays || event.dias_activos)
        : [...EVENT_WEEK_DAYS],
      sendAt: event.sendAt || event.fecha_envio || '',
      sendMode: event.sendAt || event.fecha_envio || event.status === 'programado' ? 'scheduled' : 'now',
      location: event.location || '',
      capacity: event.capacity || '',
      description: event.description || '',
      targetMode: event.targetMode || event.target_mode || 'all_users',
      targetSearches: {
        technicalSkills: '',
        softSkills: '',
        academicExperience: '',
        workExperience: '',
      },
      targetSelections: {
        technicalSkills: toArray(event.targetSelections?.technicalSkills || event.habilidades_tecnicas),
        softSkills: toArray(event.targetSelections?.softSkills || event.habilidades_blandas),
        academicExperience: toArray(event.targetSelections?.academicExperience || event.experiencia_academica),
        workExperience: toArray(event.targetSelections?.workExperience || event.experiencia_laboral),
      },
    });
    setMessage('');
  }, [modal]);

  useEffect(() => () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
  }, []);

  const selectedTargetsCount = Object.values(form.targetSelections)
    .reduce((total, items) => total + items.length, 0);
  const selectedTargetTags = Object.entries(form.targetSelections)
    .flatMap(([groupId, items]) => items.map((value) => {
      const group = EVENT_PROFILE_TARGET_GROUPS.find((item) => item.id === groupId);

      return {
        groupId,
        value,
        label: value,
        groupLabel: group ? t(`adminEvents.profileTarget.${group.id}.label`) : t('adminEvents.form.segmentFallback'),
      };
    }));
  const minDateTime = getDateTimeLocalNow();
  const allWeekDaysSelected = EVENT_WEEK_DAYS.every((day) => (form.activeDays || []).includes(day));
  const targetGroups = useMemo(() => EVENT_PROFILE_TARGET_GROUPS.map((group) => ({
    ...group,
    options: Array.isArray(profileTargets?.[group.id])
      ? profileTargets[group.id]
      : group.options,
  })), [profileTargets]);

  const filteredTargetGroups = useMemo(() => {
    return targetGroups.map((group) => {
      const normalizedQuery = String(form.targetSearches[group.id] || '').trim().toLowerCase();

      return ({
        ...group,
        visibleOptions: normalizedQuery
          ? group.options.filter((option) => option.toLowerCase().includes(normalizedQuery))
          : group.options,
      });
    });
  }, [form.targetSearches, targetGroups]);

  const handleImageChange = useCallback((file) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const preview = URL.createObjectURL(file);
    objectUrlRef.current = preview;
    setForm((current) => ({
      ...current,
      imageFile: file,
      imagePreview: preview,
      imageUrl: '',
    }));
    setMessage('');
  }, []);

  const handleImageRemove = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = '';
    }

    setForm((current) => ({
      ...current,
      imageFile: null,
      imagePreview: '',
      imageUrl: '',
    }));
  }, []);

  if (!modal) return null;

  const isEditing = modal.mode === 'edit';

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const handleStartsAtChange = (value) => {
    setForm((current) => ({
      ...current,
      startsAt: value,
      endsAt: isSameOrBefore(current.endsAt, value) ? '' : current.endsAt,
      sendAt: current.sendAt && toDate(current.sendAt) > toDate(value) ? '' : current.sendAt,
    }));
    setMessage('');
  };

  const handleEndsAtChange = (value) => {
    if (value && form.startsAt && isSameOrBefore(value, form.startsAt)) {
      setMessage(t('adminEvents.form.validation.endAfterStartInline'));
      return;
    }

    handleChange('endsAt', value);
  };

  const handleTargetSearchChange = (groupId, value) => {
    setForm((current) => ({
      ...current,
      targetSearches: {
        ...current.targetSearches,
        [groupId]: value,
      },
    }));
    setMessage('');
  };

  const handleToggleTarget = (groupId, option) => {
    setForm((current) => ({
      ...current,
      targetSelections: {
        ...current.targetSelections,
        [groupId]: toggleValue(current.targetSelections[groupId] || [], option),
      },
    }));
    setMessage('');
  };

  const handleToggleActiveDay = (day) => {
    setForm((current) => ({
      ...current,
      activeDays: toggleValue(current.activeDays || [], day),
    }));
    setMessage('');
  };

  const handleToggleAllActiveDays = () => {
    setForm((current) => ({
      ...current,
      activeDays: allWeekDaysSelected ? [] : [...EVENT_WEEK_DAYS],
    }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.location.trim()) {
      setMessage(t('adminEvents.form.validation.requiredBasic'));
      return;
    }

    const startsAt = toDate(form.startsAt);
    const endsAt = toDate(form.endsAt);
    const sendAt = toDate(form.sendAt);
    const now = new Date();
    now.setSeconds(0, 0);

    if (!startsAt) {
      setMessage(t('adminEvents.form.validation.startRequired'));
      return;
    }

    if (!isEditing && startsAt < now) {
      setMessage(t('adminEvents.form.validation.startPast'));
      return;
    }

    if (!endsAt) {
      setMessage(t('adminEvents.form.validation.endRequired'));
      return;
    }

    if (endsAt <= startsAt) {
      setMessage(t('adminEvents.form.validation.endAfterStart'));
      return;
    }

    if (form.sendMode === 'scheduled') {
      if (!sendAt) {
        setMessage(t('adminEvents.form.validation.sendAtRequired'));
        return;
      }

      if (!isEditing && sendAt < now) {
        setMessage(t('adminEvents.form.validation.sendAtPast'));
        return;
      }

      if (sendAt > startsAt) {
        setMessage(t('adminEvents.form.validation.sendBeforeStart'));
        return;
      }
    }

    if (form.targetMode === 'segmented' && selectedTargetsCount === 0) {
      setMessage(t('adminEvents.form.validation.segmentRequired'));
      return;
    }

    try {
      await onSave?.({
        title: form.title,
        type: form.type,
        status: form.sendMode === 'scheduled' ? 'programado' : (form.status === 'programado' ? 'activo' : form.status),
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        activeDays: form.activeDays,
        sendAt: form.sendMode === 'scheduled' ? form.sendAt : null,
        location: form.location,
        imageFile: form.imageFile,
        imagePreview: form.imagePreview,
        imageUrl: form.imageUrl,
        capacity: form.capacity === '' ? 0 : Number(form.capacity),
        description: form.description,
        targetMode: form.targetMode,
        segments: form.targetMode === 'segmented'
          ? Object.values(form.targetSelections).flat()
          : ['all_users'],
        targetSelections: form.targetSelections,
      });
    } catch (error) {
      setMessage(error.message || t('adminEvents.form.validation.saveError'));
    }
  };

  return (
    <DashboardEdit
      title={isEditing ? t('adminEvents.form.editTitle') : t('adminEvents.form.createTitle')}
      subtitle={isEditing ? t('adminEvents.form.editSubtitle') : t('adminEvents.form.createSubtitle')}
      onClose={onClose}
      size="xl"
      ariaLabel={isEditing ? t('adminEvents.form.editTitle') : t('adminEvents.form.createTitle')}
    >
      <form className="evt-dashboard-edit-form" onSubmit={handleSubmit}>
        <DashboardEditBody>
          <div className="evt-form-grid">
            <label className="evt-field evt-field--full">
              <span>{t('adminEvents.form.title')}</span>
              <input
                type="text"
                className="evt-field-input"
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                placeholder={t('adminEvents.form.titlePlaceholder')}
              />
            </label>

            <div className="evt-field evt-field--full">
              <span>{t('adminEvents.form.image')}</span>
              <SingleEventImageUpload
                imagePreview={form.imagePreview}
                imageUrl={form.imageUrl}
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                t={t}
              />
            </div>

            <label className="evt-field">
              <span>{t('adminEvents.form.type')}</span>
              <select
                className="evt-field-input"
                value={form.type}
                onChange={(event) => handleChange('type', event.target.value)}
              >
                {EVENT_TYPES.filter((type) => type.id !== 'todos').map((type) => (
                  <option key={type.id} value={type.id}>{t(`adminEvents.type.${type.id}`)}</option>
                ))}
              </select>
            </label>

            <label className="evt-field">
              <span>{t('adminEvents.form.status')}</span>
              <select
                className="evt-field-input"
                value={form.status}
                onChange={(event) => handleChange('status', event.target.value)}
              >
                {EVENT_STATUS_FILTERS.filter((status) => ['activo', 'borrador'].includes(status.id)).map((status) => (
                  <option key={status.id} value={status.id}>{t(`adminEvents.status.${status.id}`)}</option>
                ))}
              </select>
            </label>

            <label className="evt-field">
              <span>{t('adminEvents.form.start')}</span>
              <input
                type="datetime-local"
                className="evt-field-input"
                value={form.startsAt}
                min={isEditing ? undefined : minDateTime}
                onChange={(event) => handleStartsAtChange(event.target.value)}
              />
            </label>

            <label className="evt-field">
              <span>{t('adminEvents.form.end')}</span>
              <input
                type="datetime-local"
                className="evt-field-input"
                value={form.endsAt}
                min={form.startsAt || (isEditing ? undefined : minDateTime)}
                onChange={(event) => handleEndsAtChange(event.target.value)}
              />
            </label>

            <div className="evt-field evt-field--full">
              <span>{t('adminEvents.form.activeDays')}</span>
              <div className="evt-weekday-grid" aria-label={t('adminEvents.form.activeDays')}>
                <label className="evt-weekday-option evt-weekday-option--all">
                  <input
                    type="checkbox"
                    checked={allWeekDaysSelected}
                    onChange={handleToggleAllActiveDays}
                  />
                  <span>{t('adminEvents.weekday.all')}</span>
                </label>
                {EVENT_WEEK_DAYS.map((day) => (
                  <label key={day} className="evt-weekday-option">
                    <input
                      type="checkbox"
                      checked={(form.activeDays || []).includes(day)}
                      onChange={() => handleToggleActiveDay(day)}
                    />
                    <span>{t(`adminEvents.weekday.${day}`)}</span>
                  </label>
                ))}
              </div>
              <small className="evt-field-hint">{t('adminEvents.form.activeDaysHelper')}</small>
            </div>

            <label className="evt-field">
              <span>{t('adminEvents.form.location')}</span>
              <input
                type="text"
                className="evt-field-input"
                value={form.location}
                onChange={(event) => handleChange('location', event.target.value)}
                placeholder={t('adminEvents.form.locationPlaceholder')}
              />
            </label>

            <label className="evt-field">
              <span>{t('adminEvents.form.capacity')}</span>
              <input
                type="number"
                min="0"
                className="evt-field-input"
                value={form.capacity}
                onChange={(event) => handleChange('capacity', event.target.value)}
                placeholder={t('adminEvents.form.capacityPlaceholder')}
              />
            </label>

            <label className="evt-field evt-field--full">
              <span>{t('adminEvents.form.description')}</span>
              <textarea
                className="evt-field-input evt-field-input--textarea"
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                placeholder={t('adminEvents.form.descriptionPlaceholder')}
              />
            </label>
          </div>

          <DashboardEditSection label={t('adminEvents.form.publishSection')}>
            <div className="evt-target-mode-grid">
              <button
                type="button"
                className={`evt-target-mode-card${form.sendMode === 'now' ? ' active' : ''}`}
                onClick={() => setForm((current) => ({ ...current, sendMode: 'now', sendAt: '' }))}
              >
                <span className="evt-segment-icon">
                  <BsBell />
                </span>
                <span>
                  <strong>{t('adminEvents.form.publishNow')}</strong>
                  <small>{t('adminEvents.form.publishNowHelper')}</small>
                </span>
                <span className="evt-segment-check">
                  <BsCheck2 />
                </span>
              </button>
              <button
                type="button"
                className={`evt-target-mode-card${form.sendMode === 'scheduled' ? ' active' : ''}`}
                onClick={() => handleChange('sendMode', 'scheduled')}
              >
                <span className="evt-segment-icon">
                  <BsCalendar2Plus />
                </span>
                <span>
                  <strong>{t('adminEvents.form.schedulePublish')}</strong>
                  <small>{t('adminEvents.form.schedulePublishHelper')}</small>
                </span>
                <span className="evt-segment-check">
                  <BsCheck2 />
                </span>
              </button>
            </div>

            {form.sendMode === 'scheduled' ? (
              <label className="evt-field evt-field--compact">
                <span>{t('adminEvents.form.publishDate')}</span>
                <input
                  type="datetime-local"
                  className="evt-field-input"
                  value={form.sendAt}
                  min={minDateTime}
                  max={form.startsAt || undefined}
                  onChange={(event) => handleChange('sendAt', event.target.value)}
                />
              </label>
            ) : null}
          </DashboardEditSection>

          <DashboardEditSection label={t('adminEvents.form.targetSection')}>
            <div className="evt-target-mode-grid">
              {EVENT_TARGET_MODES.map((mode) => {
                const Icon = TARGET_ICONS[mode.id] || BsPeople;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={`evt-target-mode-card${form.targetMode === mode.id ? ' active' : ''}`}
                    onClick={() => handleChange('targetMode', mode.id)}
                  >
                    <span className="evt-segment-icon">
                      <Icon />
                    </span>
                    <span>
                      <strong>{t(`adminEvents.targetMode.${mode.id}.label`)}</strong>
                      <small>{t(`adminEvents.targetMode.${mode.id}.helper`)}</small>
                    </span>
                    <span className="evt-segment-check">
                      <BsCheck2 />
                    </span>
                  </button>
                );
              })}
            </div>
          </DashboardEditSection>

          {form.targetMode === 'segmented' ? (
            <DashboardEditSection>
              <div className="evt-section-headline">
                <span className="evt-modal-section-label">{t('adminEvents.form.portfolioSegmentation')}</span>
                <strong>{t('adminEvents.common.selected', { count: selectedTargetsCount })}</strong>
              </div>

              {selectedTargetTags.length > 0 ? (
                <div className="evt-selected-tags" aria-label={t('adminEvents.form.selectedSegmentsAria')}>
                  {selectedTargetTags.map((tag) => (
                    <button
                      key={`${tag.groupId}-${tag.value}`}
                      type="button"
                      className="evt-selected-tag"
                      onClick={() => handleToggleTarget(tag.groupId, tag.value)}
                      title={t('adminEvents.form.removeTag', { label: tag.label })}
                    >
                      <small>{tag.groupLabel}</small>
                      <span>{tag.label}</span>
                      <BsX />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="evt-section-note">
                  {t('adminEvents.form.segmentHelp')}
                </p>
              )}

              <div className="evt-profile-checklist-grid">
                {filteredTargetGroups.map((group) => {
                  const Icon = PROFILE_TARGET_ICONS[group.id] || BsPeople;

                  return (
                    <article key={group.id} className="evt-profile-checklist-card">
                      <div className="evt-profile-checklist-head">
                        <span className="evt-profile-target-icon">
                          <Icon />
                        </span>
                        <span>
                          <strong>{t(`adminEvents.profileTarget.${group.id}.label`)}</strong>
                          <small>{t(`adminEvents.profileTarget.${group.id}.helper`)}</small>
                        </span>
                      </div>

                      <div className="evt-target-search evt-target-search--inside">
                        <span className="evt-search-icon">
                          <BsSearch />
                        </span>
                        <input
                          type="text"
                          className="evt-search-input"
                          value={form.targetSearches[group.id] || ''}
                          onChange={(event) => handleTargetSearchChange(group.id, event.target.value)}
                          placeholder={t(`adminEvents.profileTarget.${group.id}.placeholder`)}
                          aria-label={t(`adminEvents.profileTarget.${group.id}.placeholder`)}
                        />
                      </div>

                      <div className="evt-checkbox-list">
                        {group.visibleOptions.map((option) => (
                          <label key={option} className="evt-checkbox-row">
                            <input
                              type="checkbox"
                              checked={(form.targetSelections[group.id] || []).includes(option)}
                              onChange={() => handleToggleTarget(group.id, option)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                        {!group.visibleOptions.length ? (
                          <span className="evt-checkbox-empty">
                            {profileTargetsLoading
                              ? t('adminEvents.form.loadingOptions')
                              : (form.targetSearches[group.id] ? t('adminEvents.form.noMatches') : t('adminEvents.form.noOptions'))}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="evt-section-note">
                {t('adminEvents.form.audienceHelp')}
              </p>
            </DashboardEditSection>
          ) : (
            <div className="evt-audience-preview">
              <strong>{t('adminEvents.form.allAudience')}</strong>
              <span>{t('adminEvents.form.platformUsers')}</span>
              <small>{t('adminEvents.targetMode.all_users.helper')}</small>
            </div>
          )}

          <DashboardEditFieldError msg={message} />
        </DashboardEditBody>

        <DashboardEditFooter className="evt-dashboard-edit-footer">
          <span className="evt-dashboard-edit-footer-note">{t('adminEvents.form.footer')}</span>
          <div className="evt-modal-actions">
            <button type="button" className="evt-reason-btn evt-reason-btn--ghost" onClick={onClose}>
              {t('adminEvents.common.cancel')}
            </button>
            <button type="submit" className="evt-reason-btn evt-reason-btn--primary">
              <BsCheck2 />
              {t('adminEvents.form.saveEvent')}
            </button>
          </div>
        </DashboardEditFooter>
      </form>
    </DashboardEdit>
  );
}
