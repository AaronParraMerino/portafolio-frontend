import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../../../../core/i18n";
import SkillForm from "../components/SkillForm";
import {
  getUserSkills,
  getCachedUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  createCatalogSkill,
} from "../services/skillService";
import ExperienceToast from "../../experience/components/ExperienceToast";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import Header from "../../layout/Header";
import {
  getSkillLevelColor,
  getSkillProgress,
} from "../model/skillLevel";

const normalizeSkillName = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const normalizeSkillType = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getSkillName = (skill) =>
  skill?.nombre ?? skill?.nombre_habilidad ?? skill?.habilidad?.nombre ?? "";

const getSkillDescription = (skill, t) =>
  skill?.descripcion ??
  skill?.descripcion_habilidad ??
  skill?.habilidad?.descripcion ??
  t("skills.noDescription");

const getInitialSkills = () => {
  try {
    return getCachedUserSkills();
  } catch {
    return [];
  }
};

export default function SkillsPage() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState(getInitialSkills);
  const [loading, setLoading] = useState(() => getInitialSkills().length === 0);
  const [modalMode, setModalMode] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [toast, setToast] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    subtitle: "",
    message: "",
    confirmLabel: t("skills.common.save"),
    cancelLabel: t("skills.common.cancel"),
    variant: "blue",
    icon: "check",
    onConfirm: () => {},
  });

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSkills = useCallback(async () => {
    const hasCache = getInitialSkills().length > 0;

    try {
      setLoading(!hasCache);
      const data = await getUserSkills({ force: true });
      setSkills(data);
    } catch (err) {
      showToast(t("skills.toast.loadError"), "error");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleSaveRequest = async (formData) => {
    try {
      let skillIdFromCatalog = formData.catalogo_habilidad_id;

      if (!skillIdFromCatalog) {
        const newCatalogSkill = await createCatalogSkill(
          formData.nombre_habilidad,
          formData.tipo,
          formData.descripcion_nueva || ""
        );

        skillIdFromCatalog = newCatalogSkill.id;
      }

      if (modalMode !== "edit") {
        const duplicateOwned = skills.some(
          (skill) =>
            normalizeSkillName(getSkillName(skill)) ===
            normalizeSkillName(formData.nombre_habilidad)
        );

        if (duplicateOwned) {
          showToast(
            t("skills.toast.duplicateOwned", { name: formData.nombre_habilidad }),
            "error"
          );
          return;
        }
      }

      if (modalMode === "edit") {
        const updated = await updateUserSkill(selectedSkill.id, formData.nivel);

        setSkills((prev) => {
          const selectedId = Number(selectedSkill.id);
          const updatedId = Number(updated?.id);

          if (updatedId && updatedId === selectedId) {
            return prev.map((s) =>
              Number(s.id) === selectedId ? updated : s
            );
          }

          return prev.map((s) => {
            if (Number(s.id) !== selectedId) return s;

            return {
              ...s,
              nivel: formData.nivel,
            };
          });
        });

        showToast(t("skills.toast.updated"), "ok");
      } else {
        const created = await addUserSkill(skillIdFromCatalog, formData.nivel);

        setSkills((prev) => [created, ...prev]);
        showToast(t("skills.toast.added"), "ok");
      }

      setModalMode(null);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteRequest = (id) => {
    const skill = skills.find((s) => Number(s.id) === Number(id));

    setConfirmConfig({
      open: true,
      title: t("skills.delete.title"),
      subtitle: t("skills.delete.subtitle"),
      message: t("skills.delete.message", {
        name: getSkillName(skill) || t("skills.delete.fallback"),
      }),
      confirmLabel: t("skills.delete.confirm"),
      cancelLabel: t("skills.common.cancel"),
      variant: "red",
      icon: "warning",
      onConfirm: async () => {
        try {
          await deleteUserSkill(id);

          setSkills((prev) =>
            prev.filter((s) => Number(s.id) !== Number(id))
          );

          showToast(t("skills.toast.deleted"), "ok");
        } catch (err) {
          showToast(t("skills.toast.deleteError"), "error");
        }

        setConfirmConfig((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const openAddModal = () => {
    setSelectedSkill(null);
    setModalMode("add");
  };

  const tecnicas = skills.filter(
    (s) => normalizeSkillType(s.tipo) === "tecnica"
  );

  const blandas = skills.filter(
    (s) => normalizeSkillType(s.tipo) === "blanda"
  );

  return (
    <>
      <style>{`
        .skill-page-body {
          min-height: calc(100vh - var(--nav-height, 60px));
          background: var(--fondo);
          font-family: var(--font);
        }

        .skill-add-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          background: var(--azul);
          color: var(--blanco);
          font-family: var(--font);
          font-size: .9rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, background .15s ease, box-shadow .15s ease;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 119, 183, .18);
        }

        .skill-add-btn:hover {
          background: var(--azul-hover);
          color: var(--blanco);
          box-shadow: 0 4px 12px rgba(0, 119, 183, .3);
          transform: translateY(-1px);
        }

        .skill-section-divider {
          font-weight: 800;
          color: var(--negro-texto);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 2rem 0 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: .95rem;
        }

        .skill-section-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--gris-borde);
        }

        .skill-long-card {
          background: var(--blanco);
          border-radius: 16px;
          border: 1px solid var(--gris-borde);
          border-left: 6px solid var(--azul);
          padding: 1.2rem;
          margin-bottom: 1rem;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          box-shadow: 0 1px 4px rgba(0, 0, 0, .04);
        }

        .skill-long-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, .05);
          border-color: var(--azul-mid);
        }

        .skill-main-info {
          min-width: 250px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .level-circle-badge {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--blanco);
          font-family: var(--font);
          font-weight: 800;
          font-size: .7rem;
          letter-spacing: .04em;
          text-transform: uppercase;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(0, 0, 0, .12);
        }

        .skill-name {
          margin: 0;
          color: var(--negro-texto);
          font-size: .96rem;
          font-weight: 800;
          line-height: 1.25;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .skill-description {
          margin: 3px 0 0;
          color: var(--gris-texto);
          font-size: .82rem;
          line-height: 1.45;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .skill-progress-zone {
          flex: 1;
          min-width: 200px;
          max-width: 400px;
          margin-inline: 1.5rem;
        }

        .skill-progress-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }

        .skill-progress-label {
          color: var(--gris-texto);
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .skill-progress-value {
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 700;
        }

        .skill-progress-track {
          height: 8px;
          width: 100%;
          background: var(--gris-borde);
          border-radius: 10px;
          overflow: hidden;
        }

        .skill-progress-bar {
          height: 100%;
          border-radius: 10px;
          transition: width 1s ease;
        }

        .skill-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-action-skill {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          font-family: var(--font);
          font-size: .85rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform .15s ease, color .15s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease;
          white-space: nowrap;
        }

        .btn-action-skill:hover {
          transform: translateY(-1px);
        }

        .btn-edit:hover {
          color: var(--amarillo-hover);
          border-color: var(--amarillo);
          background: var(--amarillo-chip);
          box-shadow: 0 3px 10px rgba(251, 191, 36, .18);
        }

        .btn-delete:hover {
          color: var(--rojo-soft);
          border-color: var(--rojo-soft);
          background: var(--rojo-chip);
          box-shadow: 0 3px 10px rgba(232, 85, 85, .14);
        }

        .skill-empty-category {
          background: var(--blanco);
          border: 1.5px dashed var(--gris-borde);
          border-radius: 12px;
          color: var(--gris-texto);
          font-size: .86rem;
          padding: 18px;
          margin-bottom: 1.2rem;
        }

        .skill-empty-state {
          margin: 2.2rem auto 0;
          max-width: 680px;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 18px;
          padding: 2.2rem 2rem;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, .05);
          position: relative;
          overflow: hidden;
        }

        .skill-empty-state::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, var(--azul), var(--azul-mid));
        }

        .skill-empty-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 14px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--azul-light);
          border: 1.5px solid var(--azul-mid);
          color: var(--azul);
          font-size: 1.45rem;
          font-weight: 800;
        }

        .skill-empty-title {
          margin: 0;
          color: var(--negro-texto);
          font-size: clamp(1.15rem, 2vw, 1.45rem);
          font-weight: 800;
          letter-spacing: -.02em;
        }

        .skill-empty-text {
          max-width: 480px;
          margin: .55rem auto 1.35rem;
          color: var(--gris-texto);
          font-size: .95rem;
          line-height: 1.55;
        }

        .skill-empty-chips {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 1.45rem;
        }

        .skill-empty-chip {
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid var(--gris-borde);
          background: var(--fondo);
          color: var(--gris-oscuro);
          font-size: .75rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .skill-long-card {
            align-items: stretch !important;
          }

          .skill-main-info {
            min-width: 100%;
          }

          .skill-progress-zone {
            min-width: 100%;
            max-width: none;
            margin-inline: 0;
          }

          .skill-actions {
            width: 100%;
          }

          .btn-action-skill {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .skill-page-body {
            padding-inline: 1rem !important;
          }

          .skill-add-btn {
            width: 100%;
          }

          .skill-long-card {
            padding: 1rem;
          }
        }
      `}</style>

      <Header
        title={t("skills.page.title")}
        actionLabel={t("skills.page.add")}
        onAction={openAddModal}
      />

      <div className="container-fluid p-4 skill-page-body">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {loading ? (
              <div className="dash-loading dash-loading--inline" role="status" aria-live="polite">
                <span className="dash-loading-spinner" />
                <span>{t("skills.loading")}</span>
              </div>
            ) : skills.length === 0 ? (
              <SkillEmptyState onAdd={openAddModal} />
            ) : (
              <>
                <h5 className="skill-section-divider">
                  {t("skills.section.technical")}
                </h5>

                {tecnicas.length === 0 ? (
                  <div className="skill-empty-category">
                    {t("skills.empty.technical")}
                  </div>
                ) : (
                  tecnicas.map((s) => (
                    <SkillLongRow
                      key={s.id}
                      skill={s}
                      onEdit={(sk) => {
                        setSelectedSkill(sk);
                        setModalMode("edit");
                      }}
                      onDelete={handleDeleteRequest}
                    />
                  ))
                )}

                <h5 className="skill-section-divider">
                  {t("skills.section.soft")}
                </h5>

                {blandas.length === 0 ? (
                  <div className="skill-empty-category">
                    {t("skills.empty.soft")}
                  </div>
                ) : (
                  blandas.map((s) => (
                    <SkillLongRow
                      key={s.id}
                      skill={s}
                      onEdit={(sk) => {
                        setSelectedSkill(sk);
                        setModalMode("edit");
                      }}
                      onDelete={handleDeleteRequest}
                    />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        {...confirmConfig}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
      />

      {modalMode && (
        <SkillForm
          onSave={handleSaveRequest}
          onCancel={() => setModalMode(null)}
          editData={selectedSkill}
          userSkills={skills}
        />
      )}

      <ExperienceToast toast={toast} />
    </>
  );
}

function SkillEmptyState({ onAdd }) {
  const { t } = useLanguage();

  return (
    <div className="skill-empty-state">
      <div className="skill-empty-icon">✦</div>

      <h3 className="skill-empty-title">
        {t("skills.empty.title")}
      </h3>

      <p className="skill-empty-text">
        {t("skills.empty.text")}
      </p>

      <div className="skill-empty-chips" aria-hidden="true">
        <span className="skill-empty-chip">{t("skills.empty.chip.technical")}</span>
        <span className="skill-empty-chip">{t("skills.empty.chip.soft")}</span>
        <span className="skill-empty-chip">{t("skills.empty.chip.level")}</span>
      </div>

      <button type="button" className="skill-add-btn" onClick={onAdd}>
        {t("skills.empty.add")}
      </button>
    </div>
  );
}

function SkillLongRow({ skill, onEdit, onDelete }) {
  const { t } = useLanguage();
  const progress = getSkillProgress(skill.nivel);
  const color = getSkillLevelColor(skill.nivel);
  const levelKey = normalizeSkillType(skill.nivel);
  const label = t(`skills.level.${levelKey}`);
  const shortLabel = t(`skills.levelShort.${levelKey}`);

  return (
    <div
      className="skill-long-card d-flex align-items-center justify-content-between flex-wrap gap-3"
      style={{ borderLeftColor: color }}
    >
      <div className="skill-main-info">
        <div
          className="level-circle-badge"
          style={{ backgroundColor: color }}
          title={label}
          aria-label={t("skills.aria.level", { level: label })}
        >
          {shortLabel}
        </div>

        <div>
          <h6 className="skill-name">
            {getSkillName(skill)}
          </h6>

          <p className="skill-description">
            {getSkillDescription(skill, t)}
          </p>
        </div>
      </div>

      <div className="skill-progress-zone">
        <div className="skill-progress-top">
          <span className="skill-progress-label">
            {t("skills.progress")}
          </span>

          <span
            className="skill-progress-value"
            style={{ color }}
          >
            {progress}%
          </span>
        </div>

        <div className="skill-progress-track">
          <div
            className="skill-progress-bar"
            style={{
              width: `${progress}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      <div className="skill-actions">
        <button
          type="button"
          onClick={() => onEdit(skill)}
          className="btn-action-skill btn-edit"
          title={t("skills.edit")}
          aria-label={t("skills.aria.edit")}
        >
          {t("skills.edit")}
        </button>

        <button
          type="button"
          onClick={() => onDelete(skill.id)}
          className="btn-action-skill btn-delete"
          title={t("skills.delete")}
          aria-label={t("skills.aria.delete")}
        >
          {t("skills.delete")}
        </button>
      </div>
    </div>
  );
}
