import React, { useCallback, useEffect, useMemo, useState } from "react";
import ExperienceForm from "../components/ExperienceForm";
import ExperienceToast from "../components/ExperienceToast";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import BackgroundSaveIndicator from "../../../../shared/ui/BackgroundSaveIndicator";
import Header from "../../layout/Header";
import DashboardListSummary from "../../layout/DashboardListSummary";
import DashboardListControls from "../../layout/DashboardListControls";
import DashboardPagination from "../../layout/DashboardPagination";
import DashboardEmptyState from "../../layout/DashboardEmptyState";
import {
  DashboardAcademicIcon,
  DashboardDeleteIcon,
  DashboardEditIcon,
  DashboardWorkIcon,
} from "../../layout/DashboardIcons";
import { useLanguage } from "../../../../core/i18n";
import {
  getExperiencias,
  getCachedExperiencias,
  createExperiencia,
  updateExperiencia,
  deleteExperiencia,
} from "../services/experienceService";
import "../styles/experience.css";

const EXPERIENCE_PAGE_SIZE = 4;

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

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const isAcademicExperience = (exp) =>
  normalizeText(exp?.tipo_experiencia).includes("academ");

const isWorkExperience = (exp) =>
  normalizeText(exp?.tipo_experiencia).includes("labor");

export default function ExperiencePage() {
  const { t } = useLanguage();
  const [experiencias, setExperiencias] = useState(getInitialExperiencias);
  const [modalMode, setModalMode] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(() => getInitialExperiencias().length === 0);
  const [savingCount, setSavingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("recientes");
  const [currentPage, setCurrentPage] = useState(1);
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

  const conteo = useMemo(() => ({
    todos: experiencias.length,
    laboral: experiencias.filter(isWorkExperience).length,
    academica: experiencias.filter(isAcademicExperience).length,
    actual: experiencias.filter((exp) => Boolean(exp.actual)).length,
  }), [experiencias]);

  const filteredExperiencias = useMemo(() => {
    const query = normalizeText(searchTerm);

    return experiencias
      .filter((exp) => {
        if (typeFilter === "laboral" && !isWorkExperience(exp)) return false;
        if (typeFilter === "academica" && !isAcademicExperience(exp)) return false;
        if (typeFilter === "actual" && !exp.actual) return false;

        if (!query) return true;

        return [
          exp.puesto,
          exp.empresa,
          exp.descripcion,
          exp.tipo_experiencia,
          exp.fecha_inicio,
          exp.fecha_fin,
        ].some((value) => normalizeText(value).includes(query));
      })
      .sort((a, b) => {
        if (typeFilter === "todos") {
          const aGroup = isWorkExperience(a) ? "0" : "1";
          const bGroup = isWorkExperience(b) ? "0" : "1";
          if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
        }

        if (sortBy === "antiguos") {
          return String(a.fecha_inicio || "").localeCompare(String(b.fecha_inicio || ""));
        }

        if (sortBy === "alfa") {
          return String(a.puesto || "").localeCompare(String(b.puesto || ""));
        }

        return String(b.fecha_inicio || "").localeCompare(String(a.fecha_inicio || ""));
      });
  }, [experiencias, searchTerm, sortBy, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, sortBy, experiencias.length]);

  const pagedExperiencias = useMemo(() => {
    const start = (currentPage - 1) * EXPERIENCE_PAGE_SIZE;
    return filteredExperiencias.slice(start, start + EXPERIENCE_PAGE_SIZE);
  }, [currentPage, filteredExperiencias]);

  return (
    <>

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
            ) : (
              <>
                <DashboardListSummary
                  title={t("experience.summary.title")}
                  description={t("experience.summary.description")}
                  count={conteo.todos}
                  label={t("experience.filters.all")}
                />

                <DashboardListControls
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchPlaceholder={t("experience.filters.searchPlaceholder")}
                  searchAria={t("experience.filters.searchAria")}
                  tabs={[
                    { value: "todos", label: t("experience.filters.all"), count: conteo.todos },
                    { value: "laboral", label: t("experience.filters.work"), count: conteo.laboral },
                    { value: "academica", label: t("experience.filters.academic"), count: conteo.academica },
                    { value: "actual", label: t("experience.filters.current"), count: conteo.actual },
                  ]}
                  activeTab={typeFilter}
                  onTabChange={setTypeFilter}
                  sortValue={sortBy}
                  onSortChange={setSortBy}
                  sortAria={t("experience.filters.sortAria")}
                  sortOptions={[
                    { value: "recientes", label: t("experience.filters.sort.recent") },
                    { value: "antiguos", label: t("experience.filters.sort.oldest") },
                    { value: "alfa", label: t("experience.filters.sort.alpha") },
                  ]}
                />

                {experiencias.length === 0 ? (
                  <DashboardEmptyState
                    icon={DashboardWorkIcon}
                    title={t("experience.empty.title")}
                    description={t("experience.empty.text")}
                    actionLabel={t("experience.empty.add")}
                    onAction={openAddModal}
                  />
                ) : filteredExperiencias.length === 0 ? (
                  <div className="exp-category-empty">
                    {t("experience.empty.filtered")}
                  </div>
                ) : (
                  <div className="exp-edit-list">
                    {pagedExperiencias.map((exp, index) => {
                      const currentType = isAcademicExperience(exp) ? "academica" : "laboral";
                      const previousExp = pagedExperiencias[index - 1];
                      const previousType = previousExp
                        ? (isAcademicExperience(previousExp) ? "academica" : "laboral")
                        : "";
                      const showSection = typeFilter === "todos" && currentType !== previousType;

                      return (
                        <React.Fragment key={exp.id}>
                          {showSection && (
                            <div className="dash-list-section-break">
                              {currentType === "academica"
                                ? t("experience.section.academic")
                                : t("experience.section.work")}
                            </div>
                          )}

                          <ExperienceCard
                            exp={exp}
                            onEdit={() => {
                              setSelectedExp(exp);
                              setModalMode("edit");
                            }}
                            onDelete={() => handleDeleteRequest(exp.id)}
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                <DashboardPagination
                  page={currentPage}
                  pageSize={EXPERIENCE_PAGE_SIZE}
                  totalItems={filteredExperiencias.length}
                  onPageChange={setCurrentPage}
                />
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

function ExperienceCard({ exp, onEdit, onDelete }) {
  const { t } = useLanguage();
  const isAcademica = isAcademicExperience(exp);

  const fechaInicio = formatearFechaCompleta(exp.fecha_inicio, t);
  const fechaFin = exp.actual
    ? t("experience.date.current")
    : formatearFechaCompleta(exp.fecha_fin, t);

  return (
    <article
      className={`exp-edit-card ${isAcademica ? "is-academica" : "is-laboral"}`}
    >
      <div className="exp-edit-content">
        <div className="exp-edit-body">
          <div className="exp-edit-top">
            <div className="exp-edit-badges">
              <span
                className={`exp-edit-badge ${
                  isAcademica ? "is-academica" : "is-laboral"
                }`}
              >
                {isAcademica ? <DashboardAcademicIcon /> : <DashboardWorkIcon />}
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
              <DashboardEditIcon />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="exp-edit-action-btn is-delete"
              title={t("experience.actions.delete")}
              aria-label={t("experience.aria.delete")}
            >
              <DashboardDeleteIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
