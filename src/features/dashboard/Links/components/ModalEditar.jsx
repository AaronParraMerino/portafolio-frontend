import { useState } from "react";
import { useLanguage } from "../../../../core/i18n";
import {
  DashboardCheckIcon,
  DashboardEditIcon,
} from "../../layout/DashboardIcons";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
} from "../../layout/DashboardEdit";
import {
  getLinkPlatform,
  LinkPlatformIcon,
} from "../model/linkPlatforms";

function ModalEditar({ onClose, onSave, red, isKnownPlatform }) {
  const { t } = useLanguage();
  const [titulo, setTitulo] = useState(red.nombre || "");
  const [desc, setDesc] = useState(red.descripcion || "");
  const [err, setErr] = useState({});

  const platInfo = getLinkPlatform(red);

  const validate = () => {
    const nextErrors = {};
    if (!titulo.trim()) nextErrors.titulo = t("links.validation.titleRequired");
    if (!desc.trim()) nextErrors.desc = t("links.validation.descriptionRequired");
    setErr(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...red, nombre: titulo.trim(), descripcion: desc.trim() });
  };

  return (
    <DashboardEdit
      title={t("links.modal.editTitle")}
      subtitle={red?.nombre || t("links.customNetwork")}
      onClose={onClose}
      size="sm"
    >
      <DashboardEditBody>
        <div className="links-modal-platform">
          <LinkPlatformIcon platform={platInfo} url={red.url} />
          <div>
            <p className="links-modal-platform-title">
              {platInfo ? platInfo.name : t("links.customNetwork")}
            </p>
            <p className="links-modal-platform-subtitle">
              <DashboardCheckIcon />
              {red.url}
            </p>
          </div>
        </div>

        <DashboardEditSection label={t("links.field.title")}>
          {isKnownPlatform ? (
            <span className="links-locked-hint">{t("links.lockedKnownPlatform")}</span>
          ) : null}
          <input
            value={titulo}
            onChange={(event) => !isKnownPlatform && setTitulo(event.target.value)}
            readOnly={isKnownPlatform}
            placeholder={t("links.field.editTitlePlaceholder")}
            className={`dash-edit-input${err.titulo ? " dash-edit-input-error" : ""}`}
          />
          {isKnownPlatform ? (
            <p className="links-field-help">{t("links.lockedTitleHelp")}</p>
          ) : null}
          <DashboardEditFieldError msg={err.titulo} />
        </DashboardEditSection>

        <DashboardEditSection label={t("links.field.description")}>
          <textarea
            value={desc}
            onChange={(event) => setDesc(event.target.value)}
            rows={3}
            placeholder={t("links.field.descriptionPlaceholder")}
            className={`dash-edit-textarea${err.desc ? " dash-edit-input-error" : ""}`}
          />
          <DashboardEditFieldError msg={err.desc} />
        </DashboardEditSection>
      </DashboardEditBody>

      <DashboardEditFooter>
        <button type="button" className="dash-edit-btn dash-edit-btn--secondary" onClick={onClose}>
          {t("links.action.cancel")}
        </button>
        <button type="button" className="dash-edit-btn dash-edit-btn--primary" onClick={submit}>
          <DashboardEditIcon />
          {t("links.action.saveChanges")}
        </button>
      </DashboardEditFooter>
    </DashboardEdit>
  );
}

export default ModalEditar;
