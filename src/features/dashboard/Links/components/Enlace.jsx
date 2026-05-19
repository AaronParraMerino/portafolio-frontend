import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import Header from '../../layout/Header';
import Card from './Card';
import Pager from './Pager';
import Modal from './Modal';
import ModalEditar from './ModalEditar';
import Toggle from './Toggle';
import { useEnlace } from '../hooks/useEnlace';

const POR_PAG = 4;

function ModalConfirmar({ nombre, onCancel, onConfirm }) {
  return (
    <>
      <div onClick={onCancel} style={{ position:"fixed",inset:0,background:"rgba(17,24,39,.55)",zIndex:50,backdropFilter:"blur(2px)",animation:"fi .18s ease" }} />
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(380px,92vw)",background:"#fff",borderRadius:14,boxShadow:"0 20px 50px rgba(0,0,0,.2)",zIndex:51,padding:"28px 28px 24px",animation:"su .22s cubic-bezier(.34,1.56,.64,1) both" }}>
        <div style={{ width:52,height:52,borderRadius:"50%",background:"#fef2f2",border:"2px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="#e85555" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#e85555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <p style={{ margin:"0 0 8px",textAlign:"center",fontWeight:700,fontSize:16,color:"#0f172a" }}>¿Eliminar este enlace?</p>
        <p style={{ margin:"0 0 6px",textAlign:"center",fontSize:13,color:"#6b7280" }}>Estás a punto de eliminar</p>
        <p style={{ margin:"0 0 20px",textAlign:"center",fontWeight:700,fontSize:14,color:"#e85555" }}>"{nombre}"</p>
        <p style={{ margin:"0 0 22px",textAlign:"center",fontSize:12,color:"#9ca3af",background:"#f9fafb",borderRadius:7,padding:"8px 12px" }}>Esta acción no se puede deshacer.</p>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,padding:"10px 0",borderRadius:8,border:"1.5px solid #d1d5db",background:"#fff",color:"#374151",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex:1,padding:"10px 0",borderRadius:8,border:"none",background:"#e85555",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>Sí, eliminar</button>
        </div>
      </div>
      <style>{`@keyframes fi{from{opacity:0}to{opacity:1}} @keyframes su{from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
    </>
  );
}

export default function RedesSociales() {

  const navigate = useNavigate();

  const { redes, loading, error, setError, agregar, editar, toggleVisible, eliminar } = useEnlace();

  const [secActiva,        setSecActiva]        = useState(true);
  const [modal,            setModal]            = useState(false);
  // ── redEditar ahora guarda { red, isKnownPlatform } ──────────────────
  const [redEditar,        setRedEditar]        = useState(null);
  const [confirmarId,      setConfirmarId]      = useState(null);
  const [pgA,              setPgA]              = useState(1);
  const [pgO,              setPgO]              = useState(1);

  const activas = redes.filter(r =>  r.visible);
  const ocultas = redes.filter(r => !r.visible);
  const pgdA    = activas.slice((pgA-1)*POR_PAG, pgA*POR_PAG);
  const pgdO    = ocultas.slice((pgO-1)*POR_PAG, pgO*POR_PAG);

  const handleToggle  = (id)  => { toggleVisible(id); setPgA(1); setPgO(1); };

  const handleAdd     = async (n) => {
    await agregar(n);
    setPgA(1);
    setModal(false);
  };

  const handleSave    = async (upd) => {
    await editar(upd);
    setRedEditar(null);
  };

  // ── Recibe (red, isKnownPlatform) desde Card ─────────────────────────
  const handleEdit = (red, isKnownPlatform) => {
    setRedEditar({ red, isKnownPlatform });
  };

  const pedirEliminar   = (id) => setConfirmarId(id);
  const cancelarBorrar  = ()   => setConfirmarId(null);
  const confirmarBorrar = async () => {
    await eliminar(confirmarId);
    setConfirmarId(null);
    setPgA(1);
  };

  const redAEliminar = redes.find(r => r.id === confirmarId);

  if (loading) return (
    <div style={{ fontFamily:"var(--font)" }}>
      <Header title="Redes Profesionales" />
      <div style={{ maxWidth:640,margin:"0 auto",padding:"24px 16px 40px" }}>
        <div className="dash-loading dash-loading--inline" role="status" aria-live="polite">
          <span className="dash-loading-spinner" />
          <span>Cargando enlaces...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"var(--font)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;}`}</style>

      {/* BANNER */}
      <Header
        title="Redes Profesionales"
        actions={[
          {
            label: "Agregar nueva",
            title: "Agregar nueva red profesional",
            icon: <FiPlus />,
            onClick: () => setModal(true),
          },
        ]}
      />

      <div style={{ maxWidth:640,margin:"0 auto",padding:"24px 16px 40px" }}>

        {error && (
          <div style={{ marginBottom:14,padding:"10px 14px",borderRadius:8,background:"#fef2f2",border:"1.5px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
            <span style={{ fontSize:13,color:"#b91c1c" }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"#b91c1c",fontWeight:700,fontSize:16,lineHeight:1 }}>×</button>
          </div>
        )}

        <p style={{ margin:"0 0 14px",fontSize:13,color:"#6b7280" }}>Tus perfiles en plataformas profesionales y repositorios de código</p>

        <div style={{ border:"1.5px solid #93c5fd",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,background:"#fff" }}>
          <div>
            <p style={{ margin:0,fontWeight:700,fontSize:13,color:"#0077b7" }}>Redes profesionales visibles en portafolio publico</p>
            <p style={{ margin:"2px 0 0",fontSize:12,color:"#6b7280" }}>{secActiva ? "Los visitantes veran los enlaces a tu perfil" : "Sección desactivada — no visible en portafolio"}</p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Toggle on={secActiva} onChange={setSecActiva}/>
            <span style={{ fontSize:13,fontWeight:600,minWidth:68,color:secActiva?"#16a34a":"#e85555" }}>{secActiva ? "Activo" : "Desactivado"}</span>
          </div>
        </div>

        {secActiva ? (
          <>
            {activas.length === 0
              ? <div style={{ border:"1.5px dashed #d1d5db",borderRadius:8,padding:"28px",textAlign:"center",color:"#9ca3af",fontSize:13 }}>Sin redes activas. Agrega una nueva o activa alguna oculta.</div>
              : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {pgdA.map(r => <Card key={r.id} red={r} onToggle={handleToggle} onDelete={pedirEliminar} onEdit={handleEdit} isOculta={false}/>)}
                </div>
            }
            <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",marginTop:20,gap:8 }}>
              <div/>
              {activas.length > POR_PAG ? <Pager total={activas.length} page={pgA} perPage={POR_PAG} onChange={setPgA}/> : <div/>}
              <div style={{ display:"flex",justifyContent:"flex-end" }}>
                <button onClick={() => navigate(-1)} style={{ padding:"9px 28px",borderRadius:7,border:"none",background:"#e85555",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Salir</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ border:"1.5px dashed rgba(232,85,85,.3)",borderRadius:8,padding:"14px 22px",textAlign:"center",marginBottom:ocultas.length > 0 ? 14 : 0 }}>
              <p style={{ margin:0,fontWeight:700,color:"#e85555",fontSize:13 }}>Sección desactivada</p>
              <p style={{ margin:"4px 0 0",fontSize:12,color:"#9ca3af" }}>{ocultas.length > 0 ? "Estas redes no son visibles en tu portafolio público." : "Activa el interruptor de arriba para mostrar tus redes."}</p>
            </div>
            {ocultas.length > 0 && (
              <div style={{ animation:"fadeUp .2s ease both" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                  <span style={{ fontSize:12,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".5px" }}>Ocultos / No visibles</span>
                  <span style={{ fontSize:11,fontWeight:600,padding:"1px 7px",borderRadius:20,background:"#f3f4f6",color:"#6b7280",border:"1px solid #e5e7eb" }}>{ocultas.length}</span>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {pgdO.map(r => <Card key={r.id} red={r} onToggle={handleToggle} onDelete={pedirEliminar} onEdit={handleEdit} isOculta={true}/>)}
                </div>
                {ocultas.length > POR_PAG && <div style={{ marginTop:10 }}><Pager total={ocultas.length} page={pgO} perPage={POR_PAG} onChange={setPgO}/></div>}
              </div>
            )}
            <div style={{ display:"flex",justifyContent:"flex-end",marginTop:20 }}>
              <button onClick={() => navigate(-1)} style={{ padding:"9px 28px",borderRadius:7,border:"none",background:"#e85555",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Salir</button>
            </div>
          </>
        )}
      </div>

      {modal     && <Modal       onClose={() => setModal(false)}    onAdd={handleAdd}/>}
      {redEditar && <ModalEditar onClose={() => setRedEditar(null)} onSave={handleSave} red={redEditar.red} isKnownPlatform={redEditar.isKnownPlatform}/>}
      {confirmarId && <ModalConfirmar nombre={redAEliminar?.nombre} onCancel={cancelarBorrar} onConfirm={confirmarBorrar}/>}
    </div>
  );
}
