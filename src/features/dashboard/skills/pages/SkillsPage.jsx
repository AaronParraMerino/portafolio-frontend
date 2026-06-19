import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import BackgroundSaveIndicator from "../../../../shared/ui/BackgroundSaveIndicator";
import Header from "../../layout/Header";
import DashboardListSummary from "../../layout/DashboardListSummary";
import DashboardListControls from "../../layout/DashboardListControls";
import DashboardPagination from "../../layout/DashboardPagination";
import {
  DashboardAddIcon,
  DashboardDeleteIcon,
  DashboardEditIcon,
  DashboardSkillIcon,
} from "../../layout/DashboardIcons";
import {
  getSkillLevelColor,
  getSkillProgress,
} from "../model/skillLevel";
import "../styles/skills.css";

const SKILLS_PAGE_SIZE = 6;

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
  const [savingCount, setSavingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nivel");
  const [currentPage, setCurrentPage] = useState(1);
  const saving = savingCount > 0;

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

  const runInBackground = (task) => {
    setSavingCount((count) => count + 1);
    Promise.resolve()
      .then(task)
      .catch((error) => {
        showToast(error.message || t("skills.catalog.error.create"), "error");
      })
      .finally(() => setSavingCount((count) => Math.max(0, count - 1)));
  };

  const handleSaveRequest = (formData) => {
    const mode = modalMode;
    const skillToEdit = selectedSkill;
    const isEdit = mode === "edit" && skillToEdit;
    const skillName = formData.nombre_habilidad || getSkillName(skillToEdit) || t("skills.delete.fallback");

    setConfirmConfig({
      open: true,
      variant: isEdit ? "blue" : "green",
      icon: "check",
      title: isEdit ? t("skills.save.editTitle") : t("skills.save.addTitle"),
      subtitle: t("skills.save.subtitle"),
      message: isEdit
        ? t("skills.save.editMessage", { name: skillName })
        : t("skills.save.addMessage", { name: skillName }),
      confirmLabel: isEdit ? t("skills.save.editConfirm") : t("skills.save.addConfirm"),
      cancelLabel: t("skills.common.cancel"),
      onConfirm: () => {
        setConfirmConfig((prev) => ({ ...prev, open: false }));
        setModalMode(null);
        setSelectedSkill(null);

        runInBackground(async () => {
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

            if (mode !== "edit") {
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

            if (mode === "edit" && skillToEdit) {
              const updated = await updateUserSkill(skillToEdit.id, formData.nivel);

              setSkills((prev) => {
                const selectedId = Number(skillToEdit.id);
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
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      },
    });
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
      onConfirm: () => {
        setConfirmConfig((prev) => ({ ...prev, open: false }));
        runInBackground(async () => {
        try {
          await deleteUserSkill(id);

          setSkills((prev) =>
            prev.filter((s) => Number(s.id) !== Number(id))
          );

          showToast(t("skills.toast.deleted"), "ok");
        } catch (err) {
          showToast(t("skills.toast.deleteError"), "error");
        }
        });
      },
    });
  };

  const openAddModal = () => {
    setSelectedSkill(null);
    setModalMode("add");
  };

  const conteo = useMemo(() => ({
    todos: skills.length,
    tecnica: skills.filter((s) => normalizeSkillType(s.tipo) === "tecnica").length,
    blanda: skills.filter((s) => normalizeSkillType(s.tipo) === "blanda").length,
  }), [skills]);

  const filteredSkills = useMemo(() => {
    const query = normalizeSkillName(searchTerm);

    return skills
      .filter((skill) => {
        const type = normalizeSkillType(skill.tipo);
        if (typeFilter !== "todos" && type !== typeFilter) return false;

        if (!query) return true;

        return [
          getSkillName(skill),
          getSkillDescription(skill, t),
          skill.nivel,
          skill.tipo,
        ].some((value) => normalizeSkillName(value).includes(query));
      })
      .sort((a, b) => {
        if (typeFilter === "todos") {
          const typeOrder = { tecnica: 0, blanda: 1 };
          const typeCompare = (typeOrder[normalizeSkillType(a.tipo)] ?? 2) - (typeOrder[normalizeSkillType(b.tipo)] ?? 2);
          if (typeCompare !== 0) return typeCompare;
        }

        if (sortBy === "nombre") {
          return getSkillName(a).localeCompare(getSkillName(b));
        }

        if (sortBy === "tipo") {
          return normalizeSkillType(a.tipo).localeCompare(normalizeSkillType(b.tipo));
        }

        return getSkillProgress(b.nivel) - getSkillProgress(a.nivel);
      });
  }, [skills, searchTerm, sortBy, t, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, sortBy, skills.length]);

  const pagedSkills = useMemo(() => {
    const start = (currentPage - 1) * SKILLS_PAGE_SIZE;
    return filteredSkills.slice(start, start + SKILLS_PAGE_SIZE);
  }, [currentPage, filteredSkills]);

  return (
    <>

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
                <DashboardListSummary
                  title={t("skills.summary.title")}
                  description={t("skills.summary.description")}
                  count={conteo.todos}
                  label={t("skills.filters.all")}
                />

                <DashboardListControls
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchPlaceholder={t("skills.filters.searchPlaceholder")}
                  searchAria={t("skills.filters.searchAria")}
                  tabs={[
                    { value: "todos", label: t("skills.filters.all"), count: conteo.todos },
                    { value: "tecnica", label: t("skills.filters.technical"), count: conteo.tecnica },
                    { value: "blanda", label: t("skills.filters.soft"), count: conteo.blanda },
                  ]}
                  activeTab={typeFilter}
                  onTabChange={setTypeFilter}
                  sortValue={sortBy}
                  onSortChange={setSortBy}
                  sortAria={t("skills.filters.sortAria")}
                  sortOptions={[
                    { value: "nivel", label: t("skills.filters.sort.level") },
                    { value: "nombre", label: t("skills.filters.sort.name") },
                    { value: "tipo", label: t("skills.filters.sort.type") },
                  ]}
                />

                {filteredSkills.length === 0 ? (
                  <div className="skill-empty-category">
                    {t("skills.empty.filtered")}
                  </div>
                ) : (
                  pagedSkills.map((s, index) => {
                    const currentType = normalizeSkillType(s.tipo);
                    const previousType = normalizeSkillType(pagedSkills[index - 1]?.tipo);
                    const showSection = typeFilter === "todos" && currentType !== previousType;

                    return (
                      <React.Fragment key={s.id}>
                        {showSection && (
                          <div className="dash-list-section-break">
                            {currentType === "blanda"
                              ? t("skills.section.soft")
                              : t("skills.section.technical")}
                          </div>
                        )}

                        <SkillLongRow
                          skill={s}
                          onEdit={(sk) => {
                            setSelectedSkill(sk);
                            setModalMode("edit");
                          }}
                          onDelete={handleDeleteRequest}
                        />
                      </React.Fragment>
                    );
                  })
                )}

                <DashboardPagination
                  page={currentPage}
                  pageSize={SKILLS_PAGE_SIZE}
                  totalItems={filteredSkills.length}
                  onPageChange={setCurrentPage}
                />
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
          onBackgroundActivity={runInBackground}
        />
      )}

      <ExperienceToast toast={toast} />
      <BackgroundSaveIndicator active={saving} label={t("skills.form.saving")} />
    </>
  );
}

function SkillEmptyState({ onAdd }) {
  const { t } = useLanguage();

  return (
    <div className="skill-empty-state">
      <div className="skill-empty-icon">
        <DashboardSkillIcon />
      </div>

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
        <DashboardAddIcon />
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
          <DashboardEditIcon />
        </button>

        <button
          type="button"
          onClick={() => onDelete(skill.id)}
          className="btn-action-skill btn-delete"
          title={t("skills.delete")}
          aria-label={t("skills.aria.delete")}
        >
          <DashboardDeleteIcon />
        </button>
      </div>
    </div>
  );
}
