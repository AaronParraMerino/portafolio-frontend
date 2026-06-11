import React, { useCallback, useEffect, useState } from "react";
import ExperienceForm from "../components/ExperienceForm";
import ExperienceToast from "../components/ExperienceToast";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import BackgroundSaveIndicator from "../../../../shared/ui/BackgroundSaveIndicator";
import Header from "../../layout/Header";
import { useLanguage } from "../../../../core/i18n";
import {
  getExperiencias,
  getCachedExperiencias,
  createExperiencia,
  updateExperiencia,
  deleteExperiencia,
} from "../services/experienceService";

const formatearFechaCompleta = (fechaStr, t) => {
  if (!fechaStr) return t("experience.date.empty");

  const [year, month, day] = String(fechaStr).slice(0, 10).split("-");
  if (!year || !month || !day) return fechaStr;

  return `${day}/${month}/${year}`;
};

const getInitialExperiencias = () => {
  try {
    return getCachedExperiencias();
  } catch {
    return [];
  }
};

export default function ExperiencePage() {
  const { t } = useLanguage();
  const [experiencias, setExperiencias] = useState(getInitialExperiencias);
  const [modalMode, setModalMode] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(() => getInitialExperiencias().length === 0);
  const [savingCount, setSavingCount] = useState(0);
  const saving = savingCount > 0;

  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    title: "",
    subtitle: "",
    message: "",
    confirmLabel: t("experience.actions.confirm"),
    onConfirm: null,
    variant: "blue",
    icon: "check",
  });

  const openAddModal = () => {
    setSelectedExp(null);
    setModalMode("add");
  };

  const showToast = useCallback((msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const closeConfirm = () =>
    setConfirmData((prev) => ({ ...prev, isOpen: false }));

  const loadExperiencias = useCallback(async () => {
    const hasCache = getInitialExperiencias().length > 0;

    try {
      setLoading(!hasCache);
      const data = await getExperiencias({ force: true });
      setExperiencias(data);
    } catch (error) {
      showToast(error.message || t("experience.error.connection"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    loadExperiencias();
  }, [loadExperiencias]);

  const runInBackground = (task) => {
    setSavingCount((count) => count + 1);
    Promise.resolve()
      .then(task)
      .finally(() => setSavingCount((count) => Math.max(0, count - 1)));
  };

  const executeSave = async (data, mode, expToEdit) => {
    try {
      if (mode === "edit" && expToEdit) {
        const updated = await updateExperiencia(expToEdit.id, data);
        setExperiencias((prev) =>
          prev.map((exp) =>
            exp.id === expToEdit.id ? { ...exp, ...updated } : exp
          )
        );
        showToast(t("experience.toast.updated"));
      } else {
        const created = await createExperiencia(data);
        setExperiencias((prev) => [created, ...prev]);
        showToast(t("experience.toast.created"));
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        t("experience.error.operation");

      showToast(errorMsg, "error");
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteExperiencia(id);
      setExperiencias((prev) => prev.filter((e) => e.id !== id));
      showToast(t("experience.toast.deleted"), "ok");
    } catch (error) {
      showToast(error.message || t("experience.error.delete"), "error");
    }
  };

  const handleSaveRequest = (data) => {
    const mode = modalMode;
    const expToEdit = selectedExp;
    const isEdit = !!expToEdit;

    setConfirmData({
      isOpen: true,
      variant: isEdit ? "blue" : "green",
      icon: "check",
      title: isEdit ? t("experience.confirm.updateTitle") : t("experience.confirm.saveTitle"),
      subtitle: isEdit
        ? t("experience.confirm.updateSubtitle")
        : t("experience.confirm.saveSubtitle"),
      message: isEdit
        ? t("experience.confirm.updateMessage", { position: data.puesto })
        : t("experience.confirm.saveMessage", { position: data.puesto }),
      confirmLabel: isEdit ? t("experience.confirm.updateConfirm") : t("experience.confirm.saveConfirm"),
      onConfirm: () => {
        closeConfirm();
        setModalMode(null);
        setSelectedExp(null);
        runInBackground(() => executeSave(data, mode, expToEdit));
      },
    });
  };

  const handleDeleteRequest = (id) => {
    const exp = experiencias.find((e) => e.id === id);

    setConfirmData({
      isOpen: true,
      variant: "red",
      icon: "warning",
      title: t("experience.confirm.deleteTitle"),
      subtitle: t("experience.confirm.deleteSubtitle"),
      message: t("experience.confirm.deleteMessage", { position: exp?.puesto || t("experience.empty.record") }),
      confirmLabel: t("experience.confirm.deleteConfirm"),
      onConfirm: () => {
        closeConfirm();
        runInBackground(() => executeDelete(id));
      },
    });
  };

  const laborales = experiencias.filter(
    (e) => e.tipo_experiencia === "Laboral"
  );

  const academicas = experiencias.filter(
    (e) => e.tipo_experiencia === "Académica"
  );

  return (
    <>
      <style>{`
        .exp-page-body {
          min-height: 100vh;
          background: var(--fondo);
        }

        .exp-add-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 8px;
          border: none;
          background: var(--azul);
          color: var(--blanco);
          font-family: var(--font);
          font-size: .92rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform .15s ease, background .15s ease, box-shadow .15s ease;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,119,183,.18);
        }

        .exp-add-btn:hover {
          background: var(--azul-hover);
          box-shadow: 0 4px 14px rgba(0,119,183,.3);
          transform: translateY(-1px);
        }

        .exp-edit-section-divider {
          margin: 1.55rem 0 .9rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .exp-edit-section-title {
          color: var(--negro-texto);
          font-family: var(--font);
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .exp-edit-section-line {
          flex: 1;
          height: 1px;
          background: var(--gris-borde);
        }

        .exp-edit-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 1.4rem;
        }

        .exp-edit-card {
          min-height: 165px;
          border: 1.5px solid var(--gris-borde);
          border-radius: 12px;
          overflow: hidden;
          background: var(--blanco);
          display: flex;
          flex-direction: row;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          transition: transform .18s ease, box-shadow .18s ease, border-color .2s ease;
        }

        .exp-edit-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,.10);
          border-color: var(--azul-mid);
        }

        .exp-edit-left-panel {
          width: 6px;
          flex-shrink: 0;
          background: var(--azul);
        }

        .exp-edit-card.is-academica .exp-edit-left-panel {
          background: var(--azul-deep);
        }

        .exp-edit-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .exp-edit-body {
          height: 100%;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .exp-edit-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .exp-edit-badges {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
        }

        .exp-edit-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 2px 9px;
          border-radius: 20px;
          line-height: 1.4;
        }

        .exp-edit-badge.is-laboral {
          color: var(--azul);
          background: var(--azul-light);
          border: 1px solid var(--azul-mid);
        }

        .exp-edit-badge.is-academica {
          color: var(--azul-deep);
          background: #ddeaf8;
          border: 1px solid #b8d0ec;
        }

        .exp-edit-current {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--mono);
          font-size: 9px;
          font-weight: 500;
          color: #059669;
          background: var(--verde-bg);
          border: 1px solid var(--verde-borde);
          padding: 2px 9px;
          border-radius: 20px;
          line-height: 1.4;
        }

        .exp-edit-current::before {
          content: "●";
          font-size: 7px;
          animation: exp-edit-blink 2s infinite;
        }

        @keyframes exp-edit-blink {
          0%, 100% { opacity: .35; }
          50% { opacity: 1; }
        }

        .exp-edit-dates {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--gris-texto);
          white-space: nowrap;
          padding-top: 2px;
        }

        .exp-edit-role {
          margin: 0;
          color: var(--negro-texto);
          font-size: 15px;
          font-weight: 700;
          line-height: 1.25;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .exp-edit-org {
          color: var(--azul);
          font-size: 12.5px;
          font-weight: 700;
          line-height: 1.35;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .exp-edit-card.is-academica .exp-edit-org {
          color: var(--azul-deep);
        }

        .exp-edit-desc {
          margin: 0;
          margin-top: auto;
          padding-top: 8px;
          color: var(--gris-texto);
          font-size: 12.5px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .exp-edit-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(209, 213, 219, .7);
        }

        .exp-edit-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--gris-borde);
          background: var(--blanco);
          color: var(--gris-oscuro);
          font-family: var(--font);
          font-size: .78rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform .18s ease, color .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
        }

        .exp-edit-action-btn:hover {
          transform: translateY(-1px);
        }

        .exp-edit-action-btn.is-edit:hover {
          color: var(--azul);
          border-color: var(--azul-mid);
          background: var(--azul-light);
          box-shadow: 0 3px 10px rgba(0,119,183,.15);
        }

        .exp-edit-action-btn.is-delete:hover {
          color: var(--rojo-soft);
          border-color: var(--rojo-soft);
          background: var(--rojo-chip);
          box-shadow: 0 3px 10px rgba(232,85,85,.14);
        }

        .exp-category-empty {
          background: var(--blanco);
          border: 1.5px dashed var(--gris-borde);
          border-radius: 12px;
          color: var(--gris-texto);
          font-size: .86rem;
          padding: 18px;
          text-align: center;
          margin-bottom: 1.4rem;
        }

        .exp-empty-state {
          margin: 2.2rem auto 0;
          max-width: 680px;
          background: var(--blanco);
          border: 1.5px solid var(--gris-borde);
          border-radius: 18px;
          padding: 2.2rem 2rem;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,.05);
          position: relative;
          overflow: hidden;
        }

        .exp-empty-state::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, var(--azul), var(--azul-mid));
        }

        .exp-empty-icon {
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

        .exp-empty-title {
          margin: 0;
          color: var(--negro-texto);
          font-size: clamp(1.15rem, 2vw, 1.45rem);
          font-weight: 800;
          letter-spacing: -.02em;
        }

        .exp-empty-text {
          max-width: 500px;
          margin: .55rem auto 1.35rem;
          color: var(--gris-texto);
          font-size: .95rem;
          line-height: 1.55;
        }

        .exp-empty-chips {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 1.45rem;
        }

        .exp-empty-chip {
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid var(--gris-borde);
          background: var(--fondo);
          color: var(--gris-oscuro);
          font-size: .75rem;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .exp-page-body {
            padding-inline: 1rem !important;
          }

          .exp-add-btn {
            width: 100%;
          }

          .exp-edit-list {
            grid-template-columns: 1fr;
          }

          .exp-edit-body {
            padding: 16px;
          }

          .exp-edit-dates {
            white-space: normal;
          }

          .exp-edit-actions {
            width: 100%;
          }

          .exp-edit-action-btn {
            flex: 1;
          }

          .exp-empty-state {
            margin-top: 1rem;
            padding: 1.7rem 1.2rem;
          }
        }
      `}</style>

      <Header
        title={t("experience.page.title")}
        actionLabel={t("experience.page.addNew")}
        onAction={openAddModal}
      />

      <div className="container-fluid p-4 exp-page-body">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {loading ? (
              <div className="dash-loading dash-loading--inline" role="status" aria-live="polite">
                <span className="dash-loading-spinner" />
                <span>{t("experience.loading")}</span>
              </div>
            ) : experiencias.length === 0 ? (
              <ExperienceEmptyState onAdd={openAddModal} />
            ) : (
              <>
                <SubsectionTitle>{t("experience.section.work")}</SubsectionTitle>

                {laborales.length === 0 ? (
                  <div className="exp-category-empty">
                    {t("experience.empty.work")}
                  </div>
                ) : (
                  <div className="exp-edit-list">
                    {laborales.map((exp) => (
                      <ExperienceCard
                        key={exp.id}
                        exp={exp}
                        onEdit={() => {
                          setSelectedExp(exp);
                          setModalMode("edit");
                        }}
                        onDelete={() => handleDeleteRequest(exp.id)}
                      />
                    ))}
                  </div>
                )}

                <SubsectionTitle>{t("experience.section.academic")}</SubsectionTitle>

                {academicas.length === 0 ? (
                  <div className="exp-category-empty">
                    {t("experience.empty.academic")}
                  </div>
                ) : (
                  <div className="exp-edit-list">
                    {academicas.map((exp) => (
                      <ExperienceCard
                        key={exp.id}
                        exp={exp}
                        onEdit={() => {
                          setSelectedExp(exp);
                          setModalMode("edit");
                        }}
                        onDelete={() => handleDeleteRequest(exp.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmData.isOpen}
        title={confirmData.title}
        subtitle={confirmData.subtitle}
        message={confirmData.message}
        confirmLabel={confirmData.confirmLabel}
        cancelLabel={t("experience.actions.cancel")}
        variant={confirmData.variant}
        icon={confirmData.icon}
        onConfirm={confirmData.onConfirm}
        onClose={closeConfirm}
      />

      {(modalMode === "add" || modalMode === "edit") && (
        <ExperienceForm
          onSave={handleSaveRequest}
          onCancel={() => setModalMode(null)}
          editData={selectedExp}
          existingExperiences={experiencias}
        />
      )}

      <ExperienceToast toast={toast} />
      <BackgroundSaveIndicator active={saving} label={t("experience.actions.processing")} />
    </>
  );
}

function SubsectionTitle({ children }) {
  return (
    <div className="exp-edit-section-divider">
      <div className="exp-edit-section-title">{children}</div>
      <div className="exp-edit-section-line" />
    </div>
  );
}

function ExperienceEmptyState({ onAdd }) {
  const { t } = useLanguage();

  return (
    <div className="exp-empty-state">
      <div className="exp-empty-icon">✦</div>

      <h3 className="exp-empty-title">{t("experience.empty.title")}</h3>

      <p className="exp-empty-text">
        {t("experience.empty.text")}
      </p>

      <div className="exp-empty-chips" aria-hidden="true">
        <span className="exp-empty-chip">{t("experience.type.work")}</span>
        <span className="exp-empty-chip">{t("experience.type.academic")}</span>
        <span className="exp-empty-chip">{t("experience.empty.chipDates")}</span>
      </div>

      <button type="button" className="exp-add-btn" onClick={onAdd}>
        {t("experience.empty.add")}
      </button>
    </div>
  );
}

function ExperienceCard({ exp, onEdit, onDelete }) {
  const { t } = useLanguage();
  const isAcademica = exp.tipo_experiencia === "Académica";

  const fechaInicio = formatearFechaCompleta(exp.fecha_inicio, t);
  const fechaFin = exp.actual
    ? t("experience.date.current")
    : formatearFechaCompleta(exp.fecha_fin, t);

  return (
    <article
      className={`exp-edit-card ${isAcademica ? "is-academica" : "is-laboral"}`}
    >
      <div className="exp-edit-left-panel" />

      <div className="exp-edit-content">
        <div className="exp-edit-body">
          <div className="exp-edit-top">
            <div className="exp-edit-badges">
              <span
                className={`exp-edit-badge ${
                  isAcademica ? "is-academica" : "is-laboral"
                }`}
              >
                {isAcademica ? t("experience.type.academicShort") : t("experience.type.work")}
              </span>

              {exp.actual && (
                <span className="exp-edit-current">
                  {t("experience.status.current")}
                </span>
              )}
            </div>

            <span className="exp-edit-dates">
              {fechaInicio} — {fechaFin}
            </span>
          </div>

          <h3 className="exp-edit-role">
            {exp.puesto}
          </h3>

          <div className="exp-edit-org">
            {exp.empresa}
          </div>

          {exp.descripcion && (
            <p className="exp-edit-desc">
              {exp.descripcion}
            </p>
          )}

          <div className="exp-edit-actions">
            <button
              type="button"
              onClick={onEdit}
              className="exp-edit-action-btn is-edit"
              title={t("experience.actions.edit")}
              aria-label={t("experience.aria.edit")}
            >
              {t("experience.actions.edit")}
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="exp-edit-action-btn is-delete"
              title={t("experience.actions.delete")}
              aria-label={t("experience.aria.delete")}
            >
              {t("experience.actions.delete")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
