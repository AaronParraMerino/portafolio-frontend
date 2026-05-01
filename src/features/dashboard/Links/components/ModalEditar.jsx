import { useState, useEffect, useRef } from "react";
import FallbackIcon from './FallbackIcon';

const PLATS = [
  { key:"linkedin",      match:u=>u.includes("linkedin.com"),                        name:"LinkedIn",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#0077B5"/><path d="M13 16h-3v12h3V16zm-1.5-4.8a1.7 1.7 0 100 3.4 1.7 1.7 0 000-3.4zM30 21.5c0-3.3-1.7-5.5-4.5-5.5-1.4 0-2.5.7-3 1.7V16h-3v12h3v-6.5c0-1.5.8-2.5 2.1-2.5 1.2 0 2 .8 2 2.5V28h3v-6.5z" fill="#fff"/></svg> },
  { key:"github",        match:u=>u.includes("github.com"),                          name:"GitHub",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#24292e"/><path fillRule="evenodd" d="M20 10a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0120 14.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0020 10z" fill="#fff"/></svg> },
  { key:"twitter",       match:u=>u.includes("twitter.com")||u.includes("x.com"),    name:"Twitter / X",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#111827"/><path d="M22.3 18.7L29.2 11h-1.6l-6 6.9-4.8-6.9H11l7.2 10.5L11 29h1.6l6.3-7.3 5 7.3H29L22.3 18.7zm-2.2 2.6l-.7-1L13.2 12h2.5l4.7 6.7.7 1 6.1 8.7h-2.5l-5-7.1z" fill="#fff"/></svg> },
  { key:"behance",       match:u=>u.includes("behance.net"),                         name:"Behance",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#1769FF"/><path d="M17.5 19.3c.9-.4 1.5-1.2 1.5-2.3 0-2-1.3-3-3.5-3H10v12h5.8c2.4 0 3.9-1.2 3.9-3.3 0-1.4-.8-2.9-2.2-3.4zM12 16h2.8c.9 0 1.5.4 1.5 1.2 0 .9-.6 1.3-1.5 1.3H12V16zm3.2 7.5H12v-3h3.2c1 0 1.7.5 1.7 1.5s-.7 1.5-1.7 1.5zM25.5 14c-3.3 0-5.5 2.3-5.5 5.5s2.2 5.5 5.5 5.5c2.6 0 4.4-1.4 5.1-3.5h-2.4c-.4.9-1.3 1.5-2.7 1.5-1.6 0-2.8-1-3-2.5H31c0-.3.1-.6.1-1 0-3.2-2.2-5.5-5.6-5.5zm-2.9 4.5c.3-1.4 1.4-2.5 2.9-2.5s2.6 1.1 2.8 2.5h-5.7zM23 13h5v1.5h-5V13z" fill="#fff"/></svg> },
  { key:"dribbble",      match:u=>u.includes("dribbble.com"),                        name:"Dribbble",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#EA4C89"/><circle cx="20" cy="20" r="10" stroke="#fff" strokeWidth="2" fill="none"/><path d="M12 14.5c2 2.5 4.5 4 7.5 4.5M28 14.5c-2.5 3-5.5 5-9.5 6M15 29c1-4 1.5-8 5-11M25 29c-1-3-2-6-4.5-8.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { key:"stackoverflow", match:u=>u.includes("stackoverflow.com"),                   name:"Stack Overflow",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#F48024"/><path d="M27 26v-5h2v7H11v-7h2v5h14z" fill="#fff"/><path d="M14.5 24.5l9.9 2.1.4-1.9-9.9-2.1-.4 1.9zM15.7 20.2l9.2 4.3.8-1.8-9.2-4.3-.8 1.8zM18.3 16.2l7.8 6.5 1.2-1.5-7.8-6.5-1.2 1.5zM22.5 13l-1.5 1.1 6 8 1.5-1.1-6-8z" fill="#fff"/></svg> },
  { key:"youtube",       match:u=>u.includes("youtube.com")||u.includes("youtu.be"), name:"YouTube",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#FF0000"/><path d="M30.5 14.5s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C23.8 10.2 20 10.2 20 10.2s-3.8 0-6.3.2c-.6.1-1.9.1-3 1.3-.9.8-1.2 2.8-1.2 2.8S9.2 16.8 9.2 19v2.1c0 2.2.3 4.5.3 4.5s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2 2.4.2 10 .3 10 .3s3.8 0 6.3-.3c.6-.1 1.9-.1 3-1.2.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.5V19c0-2.2-.3-4.5-.3-4.5zM17.6 23.4v-7.8l8.1 3.9-8.1 3.9z" fill="#fff"/></svg> },
  { key:"instagram",     match:u=>u.includes("instagram.com"),                       name:"Instagram",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><defs><linearGradient id="ig2" x1="40" y1="40" x2="0" y2="0"><stop offset="0%" stopColor="#FD1D1D"/><stop offset="50%" stopColor="#E1306C"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs><rect width="40" height="40" rx="8" fill="url(#ig2)"/><rect x="11" y="11" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="20" cy="20" r="4.5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="25.5" cy="14.5" r="1.2" fill="#fff"/></svg> },
  { key:"facebook",      match:u=>u.includes("facebook.com")||u.includes("fb.com"),  name:"Facebook",
    icon:<svg viewBox="0 0 40 40" width={40} height={40}><rect width="40" height="40" rx="8" fill="#1877F2"/><path d="M22 29v-8h2.7l.4-3H22v-1.9c0-.9.2-1.5 1.5-1.5H25V12c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V18h-2.5v3H19v8h3z" fill="#fff"/></svg> },
];

const detectPlat = url => url ? PLATS.find(p => p.match(url.toLowerCase())) || null : null;
const isValidUrl = url => { try { new URL(url.startsWith("http") ? url : `https://${url}`); return true; } catch { return false; } };

function ModalEditar({ red, onClose, onSave }) {
  const [titulo, setTitulo] = useState(red.nombre);
  const [link,   setLink]   = useState(red.url);
  const [desc,   setDesc]   = useState(red.descripcion);
  const [status, setStatus] = useState("ok");
  const [plat,   setPlat]   = useState(()=>PLATS.find(p=>p.key===red.plataformaKey)||null);
  const [err,    setErr]     = useState({});
  const timer = useRef(null);

  useEffect(()=>{
    if(!link){ setStatus("idle"); setPlat(null); return; }
    setStatus("validando"); clearTimeout(timer.current);
    timer.current = setTimeout(()=>{
      if(!isValidUrl(link)){ setStatus("error"); setPlat(null); return; }
      const p = detectPlat(link); setPlat(p); setStatus("ok");
    }, 600);
    return ()=>clearTimeout(timer.current);
  },[link]);

  useEffect(()=>{
    const h = e=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const validate = ()=>{
    const e={};
    if(!titulo.trim()) e.titulo="Título obligatorio";
    if(!link.trim())   e.link="Enlace obligatorio";
    else if(status==="error") e.link="URL no válida";
    if(!desc.trim())   e.desc="Descripción obligatoria";
    setErr(e); return !Object.keys(e).length;
  };

  const submit = ()=>{
    if(!validate()) return;
    onSave({
      ...red,
      nombre:       titulo.trim(),
      url:          link.trim().replace(/^https?:\/\/(www\.)?/,""),
      descripcion:  desc.trim(),
      plataformaKey:plat?.key || red.plataformaKey,
      conectado:    status==="ok",
    });
    onClose();
  };

  const inp = k => ({
    width:"100%", padding:"9px 12px", borderRadius:7,
    border:`1.5px solid ${err[k]?"#e85555":"#d1d5db"}`,
    fontSize:14, outline:"none", fontFamily:"inherit",
    color:"#111827", background:"#fff", transition:"border .15s", boxSizing:"border-box",
  });

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(17,24,39,.5)",zIndex:50,backdropFilter:"blur(2px)",animation:"fi .18s ease" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:"min(460px,95vw)",background:"#fff",borderRadius:14,
        boxShadow:"0 20px 50px rgba(0,0,0,.2)",zIndex:51,padding:"24px 28px",
        animation:"su .22s cubic-bezier(.34,1.56,.64,1) both" }}>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
          <p style={{ margin:0,fontWeight:700,fontSize:16,color:"#0f172a" }}>Editar red social</p>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,display:"flex",color:"#9ca3af" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          {/* Enlace */}
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Enlace / URL *</label>
            <input value={link} onChange={e=>setLink(e.target.value)} placeholder="ej: linkedin.com/in/usuario" style={inp("link")}
              onFocus={e=>e.target.style.border="1.5px solid #0077b7"}
              onBlur={e=>e.target.style.border=`1.5px solid ${err.link?"#e85555":"#d1d5db"}`}/>
            {status==="validando" && <p style={{ margin:"5px 0 0",fontSize:12,color:"#9ca3af" }}>Detectando plataforma…</p>}
            {status==="ok" && (
              <div style={{ display:"flex",alignItems:"center",gap:10,marginTop:7,
                background:"#f0fdf7",border:"1px solid rgba(22,163,74,.25)",borderRadius:7,padding:"7px 10px" }}>
                <div style={{ flexShrink:0 }}>{plat ? plat.icon : <FallbackIcon url={link}/>}</div>
                <div>
                  <p style={{ margin:0,fontSize:13,fontWeight:700,color:"#0077b7" }}>{plat ? plat.name : titulo||"Red personalizada"}</p>
                  <p style={{ margin:0,fontSize:11,fontWeight:600,color:"#16a34a" }}>● Conectado — enlace válido</p>
                </div>
              </div>
            )}
            {status==="error" && <p style={{ margin:"4px 0 0",fontSize:12,color:"#e85555" }}>URL no válida</p>}
            {err.link && <p style={{ margin:"4px 0 0",fontSize:12,color:"#e85555" }}>{err.link}</p>}
          </div>

          {/* Título */}
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Título *</label>
            <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="ej: LinkedIn, GitHub…" style={inp("titulo")}
              onFocus={e=>e.target.style.border="1.5px solid #0077b7"}
              onBlur={e=>e.target.style.border=`1.5px solid ${err.titulo?"#e85555":"#d1d5db"}`}/>
            {err.titulo && <p style={{ margin:"4px 0 0",fontSize:12,color:"#e85555" }}>{err.titulo}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Descripción *</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Para qué usas esta red…"
              style={{ ...inp("desc"), resize:"vertical", lineHeight:1.5 }}
              onFocus={e=>e.target.style.border="1.5px solid #0077b7"}
              onBlur={e=>e.target.style.border=`1.5px solid ${err.desc?"#e85555":"#d1d5db"}`}/>
            {err.desc && <p style={{ margin:"4px 0 0",fontSize:12,color:"#e85555" }}>{err.desc}</p>}
          </div>
        </div>

        <div style={{ display:"flex",gap:10,marginTop:18 }}>
          <button onClick={onClose} style={{ flex:1,padding:"10px 0",borderRadius:8,border:"1px solid #d1d5db",
            background:"#fff",color:"#374151",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button onClick={submit} style={{ flex:1,padding:"10px 0",borderRadius:8,border:"none",
            background:"#0077b7",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
            Guardar cambios
          </button>
        </div>
      </div>
      <style>{`@keyframes fi{from{opacity:0}to{opacity:1}} @keyframes su{from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
    </>
  );
}

export default ModalEditar;