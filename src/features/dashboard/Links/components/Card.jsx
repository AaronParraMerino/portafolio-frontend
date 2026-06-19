import { useLanguage } from "../../../../core/i18n";
import {
  DashboardEditIcon,
  DashboardOpenIcon,
} from "../../layout/DashboardIcons";
import {
  getLinkPlatform,
  isKnownLinkPlatform,
  LinkPlatformIcon,
  normalizeLinkUrl,
} from "../model/linkPlatforms";
import IconBtn from "./IconBtn";
import Toggle from "./Toggle";

function cleanStatusLabel(value) {
  return String(value || "").replace(/^●\s*/, "");
}

function Card({ red, onToggle, onEdit, isOculta }) {
  const { t } = useLanguage();
  const conn = red.conectado && !isOculta;
  const platform = getLinkPlatform(red);
  const isKnownPlatform = isKnownLinkPlatform(red);

  return (
    <article className={`dash-card links-card${isOculta ? " is-hidden" : ""}`}>
      <div className="links-card-icon">
        <LinkPlatformIcon platform={platform} url={red.url} />
      </div>

      <div className="links-card-main">
        <div className="links-card-headline">
          <p className="links-card-title">{red.nombre}</p>
        </div>

        <a
          href={normalizeLinkUrl(red.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="links-card-url"
          title={red.url}
        >
          <DashboardOpenIcon />
          <span>{red.url}</span>
        </a>

        {red.descripcion ? (
          <p className="links-card-desc">{red.descripcion}</p>
        ) : null}
      </div>

      <div className="links-card-side">
        <div className="links-card-status-row">
          <span className={`dash-pill ${red.visible ? "dash-pill--success" : "dash-pill--purple"}`}>
            {red.visible ? t("links.status.visible") : t("links.status.hidden")}
          </span>
          <Toggle on={red.visible} onChange={() => onToggle(red.id)} />
        </div>

        <span className={`links-card-connection${conn ? " is-connected" : ""}`}>
          <span aria-hidden="true" />
          {cleanStatusLabel(conn ? t("links.status.connected") : t("links.status.disconnected"))}
        </span>

        <div className="links-card-actions">
          <IconBtn
            onClick={() => !isOculta && onEdit(red, isKnownPlatform)}
            disabled={isOculta}
            title={isOculta ? t("links.action.unavailableHidden") : t("links.action.edit")}
            variant="edit"
          >
            <DashboardEditIcon />
          </IconBtn>

        </div>
      </div>
    </article>
  );
}

export default Card;
