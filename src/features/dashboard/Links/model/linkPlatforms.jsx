import {
  SiBehance,
  SiDevdotto,
  SiDiscord,
  SiDribbble,
  SiFacebook,
  SiGithub,
  SiGitlab,
  SiGmail,
  SiInstagram,
  SiMedium,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiSpotify,
  SiStackoverflow,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import { BsBriefcase } from "react-icons/bs";

const includesAny = (patterns) => (value) =>
  patterns.some((pattern) => value.includes(pattern));

export const LINK_PLATFORMS = [
  { key: "linkedin", name: "LinkedIn", color: "#0A66C2", Icon: FaLinkedinIn, match: includesAny(["linkedin.com"]) },
  { key: "github", name: "GitHub", color: "#24292F", Icon: SiGithub, match: includesAny(["github.com"]) },
  { key: "gitlab", name: "GitLab", color: "#FC6D26", Icon: SiGitlab, match: includesAny(["gitlab.com"]) },
  { key: "gmail", name: "Gmail", color: "#EA4335", Icon: SiGmail, match: includesAny(["gmail.com", "mail.google.com", "mailto:"]) },
  { key: "twitter", name: "X / Twitter", color: "#111827", Icon: SiX, match: includesAny(["twitter.com", "x.com"]) },
  { key: "behance", name: "Behance", color: "#1769FF", Icon: SiBehance, match: includesAny(["behance.net"]) },
  { key: "dribbble", name: "Dribbble", color: "#EA4C89", Icon: SiDribbble, match: includesAny(["dribbble.com"]) },
  { key: "stackoverflow", name: "Stack Overflow", color: "#F48024", Icon: SiStackoverflow, match: includesAny(["stackoverflow.com"]) },
  { key: "youtube", name: "YouTube", color: "#FF0000", Icon: SiYoutube, match: includesAny(["youtube.com", "youtu.be"]) },
  { key: "instagram", name: "Instagram", color: "#C13584", Icon: SiInstagram, match: includesAny(["instagram.com"]) },
  { key: "facebook", name: "Facebook", color: "#1877F2", Icon: SiFacebook, match: includesAny(["facebook.com", "fb.com"]) },
  { key: "threads", name: "Threads", color: "#111827", Icon: SiThreads, match: includesAny(["threads.net"]) },
  { key: "discord", name: "Discord", color: "#5865F2", Icon: SiDiscord, match: includesAny(["discord.com", "discord.gg"]) },
  { key: "telegram", name: "Telegram", color: "#229ED9", Icon: SiTelegram, match: includesAny(["t.me", "telegram.me", "telegram.org"]) },
  { key: "whatsapp", name: "WhatsApp", color: "#25D366", Icon: SiWhatsapp, match: includesAny(["wa.me", "whatsapp.com"]) },
  { key: "snapchat", name: "Snapchat", color: "#FFFC00", Icon: SiSnapchat, match: includesAny(["snapchat.com"]), darkIcon: true },
  { key: "tiktok", name: "TikTok", color: "#111827", Icon: SiTiktok, match: includesAny(["tiktok.com"]) },
  { key: "pinterest", name: "Pinterest", color: "#E60023", Icon: SiPinterest, match: includesAny(["pinterest.com"]) },
  { key: "twitch", name: "Twitch", color: "#9146FF", Icon: SiTwitch, match: includesAny(["twitch.tv"]) },
  { key: "spotify", name: "Spotify", color: "#1DB954", Icon: SiSpotify, match: includesAny(["spotify.com"]) },
  { key: "medium", name: "Medium", color: "#111827", Icon: SiMedium, match: includesAny(["medium.com"]) },
  { key: "devto", name: "DEV.to", color: "#111827", Icon: SiDevdotto, match: includesAny(["dev.to"]) },
  { key: "reddit", name: "Reddit", color: "#FF4500", Icon: SiReddit, match: includesAny(["reddit.com"]) },
  { key: "trabajopolis", name: "Trabajopolis", color: "#0D6EFD", Icon: BsBriefcase, match: includesAny(["trabajopolis.com"]) },
  { key: "trabajito", name: "Trabajito", color: "#FF6B35", Icon: BsBriefcase, match: includesAny(["trabajito.com"]) },
];

export function normalizeLinkUrl(url = "") {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("mailto:")) return trimmed;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

export function detectLinkPlatform(url = "") {
  const clean = String(url || "").trim().toLowerCase();
  if (!clean) return null;
  return LINK_PLATFORMS.find((platform) => platform.match(clean)) || null;
}

export function getLinkPlatform(red = {}) {
  return (
    LINK_PLATFORMS.find((platform) => platform.key === red.plataformaKey) ||
    detectLinkPlatform(red.url) ||
    null
  );
}

export function isKnownLinkPlatform(red = {}) {
  return Boolean(getLinkPlatform(red));
}

export function isValidLinkUrl(url = "") {
  try {
    new URL(normalizeLinkUrl(url));
    return true;
  } catch {
    return false;
  }
}

function getFallbackInitial(url = "") {
  const cleaned = String(url || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .trim();

  return cleaned.charAt(0).toUpperCase() || "?";
}

export function LinkPlatformIcon({ platform, url, className = "" }) {
  const Icon = platform?.Icon;
  const title = platform?.name || getFallbackInitial(url);
  const iconClassName = [
    "links-platform-icon",
    platform ? "is-known" : "is-custom",
    platform?.darkIcon ? "has-dark-icon" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <span
      className={iconClassName}
      style={{ "--links-platform-color": platform?.color || "var(--azul)" }}
      title={platform?.name || title}
      aria-label={platform?.name || title}
    >
      {platform ? <Icon /> : <span>{title}</span>}
    </span>
  );
}
