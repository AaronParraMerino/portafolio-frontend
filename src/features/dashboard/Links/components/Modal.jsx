import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../../core/i18n";
import {
  DashboardAddIcon,
  DashboardCheckIcon,
} from "../../layout/DashboardIcons";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
} from "../../layout/DashboardEdit";
import {
  detectLinkPlatform,
  isValidLinkUrl,
  LinkPlatformIcon,
  normalizeLinkUrl,
} from "../model/linkPlatforms";

function Modal({ onClose, onAdd }) {
  const { t } = useLanguage();
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("idle");
  const [plat, setPlat] = useState(null);
  const [err, setErr] = useState({});
  const timer = useRef(null);

  useEffect(() => {
    if (!link) {
      setStatus("idle");
      setPlat(null);
      setTitulo("");
      return undefined;
    }

    setStatus("validando");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!isValidLinkUrl(link)) {
        setStatus("error");
        setPlat(null);
        return;
      }

      const detected = detectLinkPlatform(link);
      setPlat(detected);
      setStatus("ok");
      if (detected) setTitulo(detected.name);
    }, 450);

    return () => clearTimeout(timer.current);
  }, [link]);

  const validate = () => {
    const nextErrors = {};
    if (!titulo.trim()) nextErrors.titulo = t("links.validation.titleRequired");
    if (!link.trim()) nextErrors.link = t("links.validation.urlRequired");
    else if (status === "error") nextErrors.link = t("links.urlInvalid");
    if (!desc.trim()) nextErrors.desc = t("links.validation.descriptionRequired");
    setErr(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onAdd({
      nombre: titulo.trim(),
      url: normalizeLinkUrl(link),
      descripcion: desc.trim(),
      plataformaKey: plat?.key || null,
      conectado: status === "ok",
      visible: true,
    });
  };

  const tituloLocked = Boolean(plat);

  return (
    <DashboardEdit
      title={t("links.modal.addTitle")}
      subtitle={t("links.page.subtitle")}
      onClose={onClose}
      size="sm"
    >
      <DashboardEditBody>
        <DashboardEditSection label={t("links.field.url")}>
          <input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder={t("links.field.urlPlaceholder")}
            className={`dash-edit-input${err.link || status === "error" ? " dash-edit-input-error" : ""}`}
          />

          {status === "validando" ? (
            <p className="links-field-status is-loading">{t("links.detecting")}</p>
          ) : null}

          {status === "ok" ? (
            <div className="links-modal-platform is-valid">
              <LinkPlatformIcon platform={plat} url={link} />
              <div>
                <p className="links-modal-platform-title">
                  {plat ? plat.name : titulo || t("links.customNetwork")}
                </p>
                <p className="links-modal-platform-subtitle is-valid">
                  <DashboardCheckIcon />
                  {t("links.validConnected").replace(/^●\s*/, "")}
                </p>
              </div>
            </div>
          ) : null}

          {status === "error" ? (
            <p className="links-field-status is-error">{t("links.urlInvalid")}</p>
          ) : null}

          <DashboardEditFieldError msg={err.link} />
        </DashboardEditSection>

        <DashboardEditSection label={t("links.field.title")}>
          {tituloLocked ? (
            <span className="links-locked-hint">{t("links.lockedKnownPlatform")}</span>
          ) : null}
          <input
            value={titulo}
            onChange={(event) => !tituloLocked && setTitulo(event.target.value)}
            readOnly={tituloLocked}
            placeholder={t("links.field.titlePlaceholder")}
            className={`dash-edit-input${err.titulo ? " dash-edit-input-error" : ""}`}
          />
          {tituloLocked ? (
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
          <DashboardAddIcon />
          {t("links.action.addNetwork")}
        </button>
      </DashboardEditFooter>
    </DashboardEdit>
  );
}

export default Modal;
