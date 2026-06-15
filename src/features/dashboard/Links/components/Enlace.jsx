import { useState } from "react";
import Header from "../../layout/Header";
import { DashboardAddIcon } from "../../layout/DashboardIcons";
import Card from "./Card";
import Modal from "./Modal";
import ModalEditar from "./ModalEditar";
import Toggle from "./Toggle";
import { useEnlace } from "../hooks/useEnlace";
import { useLanguage } from "../../../../core/i18n";
import ConfirmModal from "../../../../shared/ui/ConfirmModal";
import BackgroundSaveIndicator from "../../../../shared/ui/BackgroundSaveIndicator";
import "../styles/links.css";

export default function RedesSociales() {
  const { t } = useLanguage();
  const { redes, loading, error, setError, agregar, editar, toggleVisible } = useEnlace();

  const [secActiva, setSecActiva] = useState(true);
  const [modal, setModal] = useState(false);
  const [redEditar, setRedEditar] = useState(null);
  const [pendingSave, setPendingSave] = useState(null);
  const [savingCount, setSavingCount] = useState(0);
  const saving = savingCount > 0;

  const runInBackground = (task) => {
    setSavingCount((count) => count + 1);
    Promise.resolve()
      .then(task)
      .finally(() => setSavingCount((count) => Math.max(0, count - 1)));
  };

  const activas = redes.filter((r) => r.visible);
  const ocultas = redes.filter((r) => !r.visible);

  const handleToggle = (id) => {
    toggleVisible(id);
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

        <p className="links-intro">{t("links.page.subtitle")}</p>

        <div className="dash-panel dash-toolbar links-visibility-panel">
          <div className="dash-toolbar-main">
            <p className="dash-toolbar-title">{t("links.section.visibleTitle")}</p>
            <p className="dash-toolbar-text">
              {secActiva
                ? t("links.section.visibleDescription")
                : t("links.section.disabledDescription")}
            </p>
          </div>

          <div className="links-visibility-state">
            <Toggle on={secActiva} onChange={setSecActiva} />
            <span className={`links-visibility-label${secActiva ? "" : " is-disabled"}`}>
              {secActiva ? t("links.status.active") : t("links.status.disabled")}
            </span>
          </div>
        </div>

        {secActiva ? (
          <>
            {activas.length === 0 ? (
              <div className="dash-empty">{t("links.empty.active")}</div>
            ) : (
              <div className="links-list">
                {activas.map((red) => (
                  <Card
                    key={red.id}
                    red={red}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    isOculta={false}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="dash-empty links-disabled-note">
              <p className="dash-toolbar-title">
                {t("links.section.disabledTitle")}
              </p>
              <p className="dash-toolbar-text">
                {ocultas.length > 0
                  ? t("links.section.disabledWithHidden")
                  : t("links.section.disabledNoHidden")}
              </p>
            </div>

            {ocultas.length > 0 && (
              <div>
                <div className="links-hidden-head">
                  <span className="links-hidden-title">{t("links.hidden.title")}</span>
                  <span className="dash-pill dash-pill--muted">{ocultas.length}</span>
                </div>

                <div className="links-list">
                  {ocultas.map((red) => (
                    <Card
                      key={red.id}
                      red={red}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      isOculta
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
    </div>
  );
}
