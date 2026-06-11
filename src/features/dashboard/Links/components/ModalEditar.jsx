import { useState, useEffect } from "react";
import FallbackIcon from './FallbackIcon';
import { useLanguage } from '../../../../core/i18n';

const PLATS = [
  { key:"linkedin",      match:u=>u.includes("linkedin.com"),                                name:"LinkedIn",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#0077B5"/><path d="M13 16h-3v12h3V16zm-1.5-4.8a1.7 1.7 0 100 3.4 1.7 1.7 0 000-3.4zM30 21.5c0-3.3-1.7-5.5-4.5-5.5-1.4 0-2.5.7-3 1.7V16h-3v12h3v-6.5c0-1.5.8-2.5 2.1-2.5 1.2 0 2 .8 2 2.5V28h3v-6.5z" fill="#fff"/></svg> },
  { key:"github",        match:u=>u.includes("github.com"),                                  name:"GitHub",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#24292e"/><path fillRule="evenodd" d="M20 10a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0120 14.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0020 10z" fill="#fff"/></svg> },
  { key:"twitter",       match:u=>u.includes("twitter.com")||u.includes("x.com"),            name:"Twitter / X",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#111827"/><path d="M22.3 18.7L29.2 11h-1.6l-6 6.9-4.8-6.9H11l7.2 10.5L11 29h1.6l6.3-7.3 5 7.3H29L22.3 18.7zm-2.2 2.6l-.7-1L13.2 12h2.5l4.7 6.7.7 1 6.1 8.7h-2.5l-5-7.1z" fill="#fff"/></svg> },
  { key:"behance",       match:u=>u.includes("behance.net"),                                 name:"Behance",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#1769FF"/><path d="M17.5 19.3c.9-.4 1.5-1.2 1.5-2.3 0-2-1.3-3-3.5-3H10v12h5.8c2.4 0 3.9-1.2 3.9-3.3 0-1.4-.8-2.9-2.2-3.4zM12 16h2.8c.9 0 1.5.4 1.5 1.2 0 .9-.6 1.3-1.5 1.3H12V16zm3.2 7.5H12v-3h3.2c1 0 1.7.5 1.7 1.5s-.7 1.5-1.7 1.5zM25.5 14c-3.3 0-5.5 2.3-5.5 5.5s2.2 5.5 5.5 5.5c2.6 0 4.4-1.4 5.1-3.5h-2.4c-.4.9-1.3 1.5-2.7 1.5-1.6 0-2.8-1-3-2.5H31c0-.3.1-.6.1-1 0-3.2-2.2-5.5-5.6-5.5zm-2.9 4.5c.3-1.4 1.4-2.5 2.9-2.5s2.6 1.1 2.8 2.5h-5.7zM23 13h5v1.5h-5V13z" fill="#fff"/></svg> },
  { key:"dribbble",      match:u=>u.includes("dribbble.com"),                                name:"Dribbble",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#EA4C89"/><circle cx="20" cy="20" r="10" stroke="#fff" strokeWidth="2" fill="none"/><path d="M12 14.5c2 2.5 4.5 4 7.5 4.5M28 14.5c-2.5 3-5.5 5-9.5 6M15 29c1-4 1.5-8 5-11M25 29c-1-3-2-6-4.5-8.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { key:"stackoverflow", match:u=>u.includes("stackoverflow.com"),                           name:"Stack Overflow",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#F48024"/><path d="M27 26v-5h2v7H11v-7h2v5h14z" fill="#fff"/><path d="M14.5 24.5l9.9 2.1.4-1.9-9.9-2.1-.4 1.9zM15.7 20.2l9.2 4.3.8-1.8-9.2-4.3-.8 1.8zM18.3 16.2l7.8 6.5 1.2-1.5-7.8-6.5-1.2 1.5zM22.5 13l-1.5 1.1 6 8 1.5-1.1-6-8z" fill="#fff"/></svg> },
  { key:"youtube",       match:u=>u.includes("youtube.com")||u.includes("youtu.be"),         name:"YouTube",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#FF0000"/><path d="M30.5 14.5s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C23.8 10.2 20 10.2 20 10.2s-3.8 0-6.3.2c-.6.1-1.9.1-3 1.3-.9.8-1.2 2.8-1.2 2.8S9.2 16.8 9.2 19v2.1c0 2.2.3 4.5.3 4.5s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2 2.4.2 10 .3 10 .3s3.8 0 6.3-.3c.6-.1 1.9-.1 3-1.2.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.5V19c0-2.2-.3-4.5-.3-4.5zM17.6 23.4v-7.8l8.1 3.9-8.1 3.9z" fill="#fff"/></svg> },
  { key:"instagram",     match:u=>u.includes("instagram.com"),                               name:"Instagram",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><defs><radialGradient id="ig-bg2" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#FFD600"/><stop offset="20%" stopColor="#FF7A00"/><stop offset="45%" stopColor="#FF0069"/><stop offset="70%" stopColor="#D300C5"/><stop offset="100%" stopColor="#7638FA"/></radialGradient></defs><rect width="40" height="40" rx="8" fill="url(#ig-bg2)"/><rect x="10" y="10" width="20" height="20" rx="6" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="20" cy="20" r="5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="26.2" cy="13.8" r="1.4" fill="#fff"/></svg> },
  { key:"facebook",      match:u=>u.includes("facebook.com")||u.includes("fb.com"),          name:"Facebook",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#1877F2"/><path d="M22 29v-8h2.7l.4-3H22v-1.9c0-.9.2-1.5 1.5-1.5H25V12c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V18h-2.5v3H19v8h3z" fill="#fff"/></svg> },
  { key:"threads",       match:u=>u.includes("threads.net"),                                 name:"Threads",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#000"/><path d="M25.2 19.4c-.1-.1-.3-.1-.4-.2-.6-2.8-2.6-4.4-5.5-4.3-1.9.1-3.3.9-4.2 2.3-.7 1.1-1 2.4-.9 3.8.1 1.4.5 2.6 1.4 3.5.9.9 2.1 1.4 3.6 1.4 1.2 0 2.2-.3 3-.9.9-.7 1.5-1.7 1.7-3h-2c-.2.7-.5 1.2-1 1.6-.5.3-1.1.5-1.8.5-.9 0-1.6-.3-2.1-.8-.5-.5-.8-1.3-.9-2.3h7.9c0-.2 0-.4 0-.6 0-1.3-.3-2.4-.8-3zm-7.9 1.8c.1-.9.4-1.6.9-2.1.5-.5 1.1-.7 1.9-.7.8 0 1.4.2 1.9.7.4.4.7 1 .8 1.8v.3h-5.5zM20 10C14.5 10 10 14.5 10 20s4.5 10 10 10 10-4.5 10-10S25.5 10 20 10z" fill="white"/></svg> },
  { key:"discord",       match:u=>u.includes("discord.com")||u.includes("discord.gg"),       name:"Discord",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#5865F2"/><path d="M28.2 13.4A18.8 18.8 0 0023.7 12c-.2.4-.4.9-.6 1.3a17.4 17.4 0 00-6.2 0A13 13 0 0016.3 12a18.8 18.8 0 00-4.5 1.4C8.7 18.1 7.9 22.6 8.3 27c2 1.4 3.9 2.3 5.8 2.8.5-.6.9-1.3 1.2-2a12 12 0 01-1.9-1l.5-.3a13.5 13.5 0 0011.5 0l.5.3c-.6.4-1.2.7-1.9 1 .4.7.8 1.4 1.2 2 1.9-.6 3.8-1.4 5.8-2.8.5-5.1-.8-9.5-3.8-13.6zM16 24.3c-1.3 0-2.4-1.2-2.4-2.7s1-2.7 2.4-2.7c1.3 0 2.4 1.2 2.3 2.7 0 1.5-1 2.7-2.3 2.7zm8.1 0c-1.3 0-2.4-1.2-2.4-2.7s1-2.7 2.4-2.7c1.4 0 2.4 1.2 2.4 2.7s-1 2.7-2.4 2.7z" fill="white"/></svg> },
  { key:"telegram",      match:u=>u.includes("t.me")||u.includes("telegram.me")||u.includes("telegram.org"), name:"Telegram",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#229ED9"/><path d="M30 11.5c-.3-.3-.8-.4-1.4-.2 0 0-18.5 7-19.3 7.6-.2.1-.2.2-.2.3.1.4.5.5.5.5l4.8 1.6s.2 0 .3-.1c.8-.5 8-5.3 8.4-5.5.1 0 .1 0 .1.1-.1.2-6.4 6-6.4 6.1l-.1.1-.3 5c0 .3.1.5.3.5.2 0 .3-.1.4-.2l2.2-2.1 4.3 3.2c.2.1.4.2.6.2.4 0 .7-.3.8-.7l3.5-16c.1-.8-.1-1.3-.5-1.6z" fill="white"/></svg> },
  { key:"whatsapp",      match:u=>u.includes("wa.me")||u.includes("whatsapp.com"),            name:"WhatsApp",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#25D366"/><path d="M20 10a10 10 0 00-8.5 15.2L10 30l4.9-1.5A10 10 0 1020 10zm4.4 12.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.3-1.8-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-1 1.6-1 2.5.1.9.4 1.8 1 2.6 1.1 1.5 2.5 2.6 4.1 3.2.6.2 1.1.3 1.7.3.5 0 1.1-.2 1.5-.5.5-.4.8-.9.9-1.4 0-.2 0-.4-.2-.5z" fill="white"/></svg> },
  { key:"snapchat",      match:u=>u.includes("snapchat.com"),                                 name:"Snapchat",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#FFFC00"/><path d="M20 11.5c-2.6 0-4.8 2-4.8 5v1.2c-.5.1-1.2.4-1.4.8-.2.4 0 .8.3 1a7 7 0 01-1.1 2.1c-.5.7-1.4.9-2.2 1 .1.5.7.9 1.4 1 .2 0 .4.1.4.3 0 .4-.8.6-.9 1 0 .4.6.7 1.1.9 1.4.5 2.3 1.7 4.2 1.7.5.7 1.2 1.2 2.1 1.2.9 0 1.6-.5 2.1-1.2 1.9 0 2.8-1.2 4.2-1.7.5-.2 1.1-.5 1.1-.9-.1-.4-.9-.6-.9-1 0-.2.2-.3.4-.3.7-.1 1.3-.5 1.4-1-.8-.1-1.7-.3-2.2-1a7 7 0 01-1.1-2.1c.3-.2.5-.6.3-1-.2-.4-.9-.7-1.4-.8v-1.2c0-3-2.2-5-4.8-5z" fill="#222"/></svg> },
  { key:"tiktok",        match:u=>u.includes("tiktok.com"),                                   name:"TikTok",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#010101"/><path d="M23.2 10h-3.4v15.2a4 4 0 11-4-4v-3.4a7.4 7.4 0 107.4 7.4V16.8a10.8 10.8 0 006.3 2v-3.4a7.4 7.4 0 01-6.3-5.4z" fill="#69C9D0" transform="translate(-1.4,0)"/><path d="M23.2 10h-3.4v15.2a4 4 0 11-4-4v-3.4a7.4 7.4 0 107.4 7.4V16.8a10.8 10.8 0 006.3 2v-3.4a7.4 7.4 0 01-6.3-5.4z" fill="#EE1D52" transform="translate(1.4,0)"/><path d="M23.2 10h-3.4v15.2a4 4 0 11-4-4v-3.4a7.4 7.4 0 107.4 7.4V16.8a10.8 10.8 0 006.3 2v-3.4a7.4 7.4 0 01-6.3-5.4z" fill="white"/></svg> },
  { key:"pinterest",     match:u=>u.includes("pinterest.com"),                                name:"Pinterest",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#E60023"/><path d="M20 10c-5.5 0-10 4.5-10 10 0 4.2 2.6 7.8 6.3 9.3-.1-.8-.1-2.1.2-3l1.3-5.6s-.3-.7-.3-1.7c0-1.6.9-2.8 2.3-2.8 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1 4.2-.3 1.3.6 2.3 1.8 2.3 2.1 0 3.6-2.7 3.6-5.9 0-2.5-1.7-4.2-4.2-4.2-2.9 0-4.5 2.1-4.5 4.3 0 .9.3 1.8.7 2.3.1.1.1.2.1.4l-.3 1.1c-.1.3-.3.4-.5.3-1.6-.7-2.5-2.9-2.5-4.7 0-3.8 2.8-7.3 8-7.3 4.2 0 7.5 3 7.5 7 0 4.2-2.6 7.5-6.3 7.5-1.2 0-2.4-.6-2.8-1.4l-.8 2.8c-.3 1.1-1 2.4-1.5 3.2.6.2 1.1.2 1.7.2 5.5 0 10-4.5 10-10S25.5 10 20 10z" fill="white"/></svg> },
  { key:"twitch",        match:u=>u.includes("twitch.tv"),                                    name:"Twitch",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#9146FF"/><path d="M11 10l-2 5v16h6v3h4l3-3h4l5-5V10H11zm17 14l-3 3h-5l-3 3v-3h-4V12h15v12z" fill="white"/><rect x="22" y="15" width="2" height="6" rx="1" fill="white"/><rect x="27" y="15" width="2" height="6" rx="1" fill="white"/></svg> },
  { key:"spotify",       match:u=>u.includes("spotify.com"),                                  name:"Spotify",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#1DB954"/><circle cx="20" cy="20" r="10" fill="#1DB954"/><path d="M14.5 17.2c3.5-1 7.8-.8 10.8 1" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M15.2 20.5c2.8-.8 6.3-.6 8.8.8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M16 23.7c2.2-.6 4.8-.4 6.7.6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg> },
  { key:"trabajopolis",  match:u=>u.includes("trabajopolis.com"),                             name:"Trabajopolis",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#0D6EFD"/><path d="M20 11L11 19v10h6v-6h6v6h6V19z" fill="white"/><rect x="16" y="12" width="8" height="3.5" rx="1" fill="#0D6EFD"/></svg> },
  { key:"trabajito",     match:u=>u.includes("trabajito.com"),                                name:"Trabajito",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#FF6B35"/><rect x="11" y="12" width="18" height="2.5" rx="1" fill="white"/><rect x="11" y="17" width="18" height="2.5" rx="1" fill="white"/><rect x="11" y="22" width="13" height="2.5" rx="1" fill="white"/><circle cx="26.5" cy="27" r="4" fill="white"/><path d="M25 27.5l1.5-2 1.5 2" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> },
  { key:"medium",        match:u=>u.includes("medium.com"),                                   name:"Medium",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#000"/><ellipse cx="17" cy="20" rx="6" ry="7.5" fill="white"/><ellipse cx="27" cy="20" rx="2.5" ry="7" fill="white"/><ellipse cx="33" cy="20" rx="1.5" ry="6" fill="white"/></svg> },
  { key:"devto",         match:u=>u.includes("dev.to"),                                       name:"DEV.to",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#0A0A0A"/><path d="M10 16h3.5c2.8 0 4.5 1.8 4.5 4s-1.7 4-4.5 4H10V16zm2 1.8v4.4h1.4c1.5 0 2.6-.8 2.6-2.2s-1.1-2.2-2.6-2.2H12zM20 16h5.5v1.8H22v1.4h3v1.8h-3v1.2h3.5V24H20V16zM28 16h2l2.5 8h-2l-.4-1.3h-2.2L27.5 24H26l2-8zm1 2.5l-.7 2.5h1.4L29 18.5z" fill="white"/></svg> },
  { key:"reddit",        match:u=>u.includes("reddit.com"),                                   name:"Reddit",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#FF4500"/><circle cx="20" cy="21" r="9" fill="white"/><path d="M20 13c.8 0 1.5.7 1.5 1.5S20.8 16 20 16s-1.5-.7-1.5-1.5S19.2 13 20 13z" fill="#FF4500"/><path d="M28.5 20c0-1.1-.9-2-2-2-.5 0-1 .2-1.4.5-1.3-.9-3-1.4-5-1.5l.9-4 2.7.6c0 .7.6 1.2 1.3 1.2.7 0 1.3-.6 1.3-1.3s-.6-1.3-1.3-1.3c-.5 0-.9.3-1.1.7l-3-.6-.9 4.8c-2.1.1-3.9.6-5.2 1.5-.4-.3-.9-.5-1.4-.5-1.1 0-2 .9-2 2 0 .8.4 1.4 1.1 1.7v.3c0 2.8 3.3 5 7.5 5s7.5-2.2 7.5-5v-.3c.6-.3 1-.9 1-1.8zm-12.5 1a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm8.5 3.5c-.9.9-2.4 1.3-4.5 1.3-2.1 0-3.6-.4-4.5-1.3-.2-.2-.2-.5 0-.7.2-.2.5-.2.7 0 .7.7 2 1 3.8 1 1.8 0 3.1-.3 3.8-1 .2-.2.5-.2.7 0 .2.2.2.5 0 .7zm-.5-2a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#FF4500"/></svg> },
];

function ModalEditar({ onClose, onSave, red, isKnownPlatform }) {
  const { t } = useLanguage();
  const [titulo, setTitulo] = useState(red.nombre      || "");
  const [desc,   setDesc]   = useState(red.descripcion || "");
  const [err,    setErr]    = useState({});

  const platInfo = PLATS.find(x => x.key === red.plataformaKey);

  // ── Cerrar con Escape ────────────────────────────
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Validación ───────────────────────────────────
  const validate = () => {
    const e = {};
    if (!titulo.trim()) e.titulo = t('links.validation.titleRequired');
    if (!desc.trim())   e.desc   = t('links.validation.descriptionRequired');
    setErr(e);
    return !Object.keys(e).length;
  };

  // ── Submit ───────────────────────────────────────
  const submit = () => {
    if (!validate()) return;
    onSave({ ...red, nombre: titulo.trim(), descripcion: desc.trim() });
  };

  // ── Estilo base input ────────────────────────────
  const inp = (k, disabled) => ({
    width: "100%", padding: "9px 12px", borderRadius: 7,
    border: `1.5px solid ${err[k] ? "#e85555" : disabled ? "#e5e7eb" : "#d1d5db"}`,
    fontSize: 14, outline: "none", fontFamily: "inherit",
    color: disabled ? "#9ca3af" : "#111827",
    background: disabled ? "#f9fafb" : "#fff",
    cursor: disabled ? "not-allowed" : "text",
    transition: "border .15s", boxSizing: "border-box",
  });

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0,
          background:"rgba(17,24,39,.5)", zIndex:50,
          backdropFilter:"blur(2px)", animation:"fi .18s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:"min(460px,95vw)", background:"#fff",
        borderRadius:14, boxShadow:"0 20px 50px rgba(0,0,0,.2)",
        zIndex:51, padding:"24px 28px",
        animation:"su .22s cubic-bezier(.34,1.56,.64,1) both",
      }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <p style={{ margin:0, fontWeight:700, fontSize:16, color:"#0f172a" }}>{t('links.modal.editTitle')}</p>
          <button
            onClick={onClose}
            style={{ background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:6, display:"flex", color:"#9ca3af" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>

          {/* Info de plataforma detectada */}
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            background:"#f8fafc", border:"1px solid #e2e8f0",
            borderRadius:7, padding:"8px 12px",
          }}>
            <div style={{ flexShrink:0 }}>
              {platInfo ? platInfo.icon : <FallbackIcon url={red.url}/>}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#0077b7" }}>
                {platInfo ? platInfo.name : t('links.customNetwork')}
              </p>
              <p style={{ margin:0, fontSize:11, color:"#9ca3af", fontFamily:"monospace",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {red.url}
              </p>
            </div>
          </div>

          {/* Título */}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>
              {t('links.field.title')}
              {isKnownPlatform && (
                <span style={{
                  marginLeft:8, fontSize:11, fontWeight:500,
                  color:"#9ca3af", background:"#f3f4f6",
                  border:"1px solid #e5e7eb", borderRadius:4,
                  padding:"1px 6px",
                }}>
                  {t('links.lockedKnownPlatform')}
                </span>
              )}
            </label>
            <input
              value={titulo}
              onChange={e => !isKnownPlatform && setTitulo(e.target.value)}
              readOnly={isKnownPlatform}
              placeholder={t('links.field.editTitlePlaceholder')}
              style={inp("titulo", isKnownPlatform)}
              onFocus={e => { if (!isKnownPlatform) e.target.style.border = "1.5px solid #0077b7"; }}
              onBlur={e  => { if (!isKnownPlatform) e.target.style.border = `1.5px solid ${err.titulo ? "#e85555" : "#d1d5db"}`; }}
            />
            {isKnownPlatform && (
              <p style={{ margin:"4px 0 0", fontSize:11, color:"#9ca3af" }}>
                {t('links.lockedTitleHelp')}
              </p>
            )}
            {err.titulo && (
              <p style={{ margin:"4px 0 0", fontSize:12, color:"#e85555" }}>{err.titulo}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>
              {t('links.field.description')}
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder={t('links.field.descriptionPlaceholder')}
              style={{ ...inp("desc", false), resize:"vertical", lineHeight:1.5 }}
              onFocus={e => e.target.style.border = "1.5px solid #0077b7"}
              onBlur={e  => e.target.style.border = `1.5px solid ${err.desc ? "#e85555" : "#d1d5db"}`}
            />
            {err.desc && (
              <p style={{ margin:"4px 0 0", fontSize:12, color:"#e85555" }}>{err.desc}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <button
            onClick={onClose}
            style={{
              flex:1, padding:"10px 0", borderRadius:8,
              border:"1px solid #d1d5db", background:"#fff",
              color:"#374151", fontSize:14, fontWeight:600,
              cursor:"pointer", fontFamily:"inherit",
            }}
          >
            {t('links.action.cancel')}
          </button>
          <button
            onClick={submit}
            style={{
              flex:1, padding:"10px 0", borderRadius:8,
              border:"none", background:"#0077b7",
              color:"#fff", fontSize:14, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit",
            }}
          >
            {t('links.action.saveChanges')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fi { from { opacity:0 } to { opacity:1 } }
        @keyframes su { from { opacity:0; transform:translate(-50%,-46%) } to { opacity:1; transform:translate(-50%,-50%) } }
      `}</style>
    </>
  );
}

export default ModalEditar;
