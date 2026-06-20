import { useEffect, useMemo, useState } from "react";
import Header from "../../layout/Header";
import { DashboardAddIcon, DashboardLinkIcon } from "../../layout/DashboardIcons";
import DashboardListSummary from "../../layout/DashboardListSummary";
import DashboardListControls from "../../layout/DashboardListControls";
import DashboardPagination from "../../layout/DashboardPagination";
import DashboardEmptyState from "../../layout/DashboardEmptyState";
import Card from "./Card";
import Modal from "./Modal";
import ModalEditar from "./ModalEditar";
import { useEnlace } from "../hooks/useEnlace";
import { useLanguage } from "../../../../core/i18n";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import BackgroundSaveIndicator from "../../../../shared/ui/BackgroundSaveIndicator";
import DashboardFeedback from "../../layout/DashboardFeedback";
import { getLinkPlatform } from "../model/linkPlatforms";
import "../styles/links.css";

const LINKS_PAGE_SIZE = 5;

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function RedesSociales() {
  const { t } = useLanguage();
  const { redes, loading, error, setError, agregar, editar, toggleVisible } = useEnlace();

  const [modal, setModal] = useState(false);
  const [redEditar, setRedEditar] = useState(null);
  const [pendingSave, setPendingSave] = useState(null);
  const [savingCount, setSavingCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [linkFilter, setLinkFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("alfa");
  const [currentPage, setCurrentPage] = useState(1);
  const saving = savingCount > 0;

  const showFeedback = (message, tipo = "ok") => {
    setFeedback({ msg: message, tipo });
    window.clearTimeout(window.__links_feedback_timer);
    window.__links_feedback_timer = window.setTimeout(() => setFeedback(null), 3000);
  };

  const runInBackground = (task, successMessage = t("actions.saved")) => {
    setSavingCount((count) => count + 1);
    Promise.resolve()
      .then(task)
      .then(() => showFeedback(successMessage, "ok"))
      .catch((saveError) => showFeedback(saveError?.message || error || t("links.error.edit"), "error"))
      .finally(() => setSavingCount((count) => Math.max(0, count - 1)));
  };

  const activas = redes.filter((r) => r.visible);
  const ocultas = redes.filter((r) => !r.visible);
  const conteo = useMemo(() => ({
    todos: redes.length,
    visible: activas.length,
    hidden: ocultas.length,
    connected: redes.filter((red) => red.conectado).length,
    custom: redes.filter((red) => !getLinkPlatform(red)).length,
  }), [activas.length, ocultas.length, redes]);

  const filteredLinks = useMemo(() => {
    const query = normalizeText(searchTerm);

    return redes
      .filter((red) => {
        if (linkFilter === "visible" && !red.visible) return false;
        if (linkFilter === "hidden" && red.visible) return false;
        if (linkFilter === "connected" && !red.conectado) return false;
        if (linkFilter === "custom" && getLinkPlatform(red)) return false;

        if (!query) return true;

        const platform = getLinkPlatform(red);
        return [
          red.nombre,
          red.url,
          red.descripcion,
          platform?.name,
        ].some((value) => normalizeText(value).includes(query));
      })
      .sort((a, b) => {
        if (sortBy === "platform") {
          return String(getLinkPlatform(a)?.name || a.nombre || "").localeCompare(
            String(getLinkPlatform(b)?.name || b.nombre || "")
          );
        }

        if (sortBy === "visibility") {
          return Number(b.visible) - Number(a.visible);
        }

        return String(a.nombre || "").localeCompare(String(b.nombre || ""));
      });
  }, [linkFilter, redes, searchTerm, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, linkFilter, sortBy, redes.length]);

  const pagedLinks = useMemo(() => {
    const start = (currentPage - 1) * LINKS_PAGE_SIZE;
    return filteredLinks.slice(start, start + LINKS_PAGE_SIZE);
  }, [currentPage, filteredLinks]);

  const handleToggle = (id) => {
    runInBackground(() => toggleVisible(id));
  };

  const handleAdd = (payload) => setPendingSave({ mode: "add", payload });
  const handleSave = (payload) => setPendingSave({ mode: "edit", payload });
  const handleEdit = (red, isKnownPlatform) => setRedEditar({ red, isKnownPlatform });

  const cancelarGuardar = () => setPendingSave(null);

  const confirmarGuardar = () => {
    const save = pendingSave;
    setPendingSave(null);
    if (!save) return;

    if (save.mode === "add") setModal(false);
    if (save.mode === "edit") setRedEditar(null);

    runInBackground(async () => {
      if (save.mode === "add") {
        await agregar(save.payload);
        return;
      }

      await editar(save.payload);
    });
  };

  const saveName = pendingSave?.payload?.nombre || "";

  if (loading) {
    return (
      <div className="dash-page links-page">
        <Header title={t("links.page.title")} />
        <div className="dash-content links-content">
          <div className="dash-loading dash-loading--inline" role="status" aria-live="polite">
            <span className="dash-loading-spinner" />
            <span>{t("links.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page links-page">
      <Header
        title={t("links.page.title")}
        actions={[
          {
            label: t("links.action.add"),
            title: t("links.action.addTitle"),
            icon: <DashboardAddIcon />,
            onClick: () => setModal(true),
          },
        ]}
      />

      <div className="dash-content links-content">
        {error && (
          <div className="dash-alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>x</button>
          </div>
        )}

        <DashboardListSummary
          title={t("links.summary.title")}
          description={t("links.page.subtitle")}
          count={conteo.todos}
          label={t("links.filters.all")}
        />

        <DashboardListControls
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={t("links.filters.searchPlaceholder")}
          searchAria={t("links.filters.searchAria")}
          tabs={[
            { value: "todos", label: t("links.filters.all"), count: conteo.todos },
            { value: "visible", label: t("links.filters.visible"), count: conteo.visible },
            { value: "hidden", label: t("links.filters.hidden"), count: conteo.hidden },
            { value: "connected", label: t("links.filters.connected"), count: conteo.connected },
            { value: "custom", label: t("links.filters.custom"), count: conteo.custom },
          ]}
          activeTab={linkFilter}
          onTabChange={setLinkFilter}
          sortValue={sortBy}
          onSortChange={setSortBy}
          sortAria={t("links.filters.sortAria")}
          sortOptions={[
            { value: "alfa", label: t("links.filters.sort.alpha") },
            { value: "platform", label: t("links.filters.sort.platform") },
            { value: "visibility", label: t("links.filters.sort.visibility") },
          ]}
        />

        {filteredLinks.length === 0 ? (
          <DashboardEmptyState
            icon={DashboardLinkIcon}
            title={t("links.summary.title")}
            description={redes.length === 0 ? t("links.empty.active") : t("links.empty.filtered")}
            actionLabel={t("links.action.add")}
            onAction={() => setModal(true)}
          />
        ) : (
          <div className="links-list">
            {pagedLinks.map((red) => (
              <Card
                key={red.id}
                red={red}
                onToggle={handleToggle}
                onEdit={handleEdit}
                isOculta={!red.visible}
              />
            ))}
          </div>
        )}

        <DashboardPagination
          page={currentPage}
          pageSize={LINKS_PAGE_SIZE}
          totalItems={filteredLinks.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {modal && <Modal onClose={() => setModal(false)} onAdd={handleAdd} />}
      {redEditar && (
        <ModalEditar
          onClose={() => setRedEditar(null)}
          onSave={handleSave}
          red={redEditar.red}
          isKnownPlatform={redEditar.isKnownPlatform}
        />
      )}

      <ConfirmModal
        open={!!pendingSave}
        title={pendingSave?.mode === "edit" ? t("links.save.editTitle") : t("links.save.addTitle")}
        subtitle={saveName}
        message={
          pendingSave?.mode === "edit"
            ? t("links.save.editMessage", { name: saveName })
            : t("links.save.addMessage", { name: saveName })
        }
        confirmLabel={pendingSave?.mode === "edit" ? t("links.save.editConfirm") : t("links.save.addConfirm")}
        cancelLabel={t("links.action.cancel")}
        variant={pendingSave?.mode === "edit" ? "blue" : "green"}
        icon="check"
        onConfirm={confirmarGuardar}
        onClose={cancelarGuardar}
      />

      <BackgroundSaveIndicator active={saving} label={t("actions.saving")} />
      <DashboardFeedback feedback={feedback} />
    </div>
  );
}
