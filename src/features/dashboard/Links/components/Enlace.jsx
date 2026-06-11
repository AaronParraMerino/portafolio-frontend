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
import { useLanguage } from '../../../../core/i18n';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import BackgroundSaveIndicator from '../../../../shared/ui/BackgroundSaveIndicator';

const POR_PAG = 4;

export default function RedesSociales() {

  const { t } = useLanguage();

  const navigate = useNavigate();

  const { redes, loading, error, setError, agregar, editar, toggleVisible, eliminar } = useEnlace();

  const [secActiva,        setSecActiva]        = useState(true);
  const [modal,            setModal]            = useState(false);
  // ── redEditar ahora guarda { red, isKnownPlatform } ──────────────────
  const [redEditar,        setRedEditar]        = useState(null);
  const [pendingSave,      setPendingSave]      = useState(null);
  const [confirmarId,      setConfirmarId]      = useState(null);
  const [pgA,              setPgA]              = useState(1);
  const [pgO,              setPgO]              = useState(1);
  const [savingCount,      setSavingCount]      = useState(0);
  const saving = savingCount > 0;

  const runInBackground = (task) => {
    setSavingCount((count) => count + 1);
    Promise.resolve()
      .then(task)
      .finally(() => setSavingCount((count) => Math.max(0, count - 1)));
  };

  const activas = redes.filter(r =>  r.visible);
  const ocultas = redes.filter(r => !r.visible);
  const pgdA    = activas.slice((pgA-1)*POR_PAG, pgA*POR_PAG);
  const pgdO    = ocultas.slice((pgO-1)*POR_PAG, pgO*POR_PAG);

  const handleToggle  = (id)  => { toggleVisible(id); setPgA(1); setPgO(1); };

  const handleAdd     = (n) => setPendingSave({ mode: 'add', payload: n });

  const handleSave    = (upd) => setPendingSave({ mode: 'edit', payload: upd });

  // ── Recibe (red, isKnownPlatform) desde Card ─────────────────────────
  const handleEdit = (red, isKnownPlatform) => {
    setRedEditar({ red, isKnownPlatform });
  };

  const pedirEliminar   = (id) => setConfirmarId(id);
  const cancelarBorrar  = ()   => setConfirmarId(null);
  const cancelarGuardar = ()   => setPendingSave(null);
  const confirmarGuardar = () => {
    const save = pendingSave;
    setPendingSave(null);
    if (!save) return;

    if (save.mode === 'add') setModal(false);
    if (save.mode === 'edit') setRedEditar(null);

    runInBackground(async () => {
      if (save.mode === 'add') {
        await agregar(save.payload);
        setPgA(1);
        return;
      }

      await editar(save.payload);
    });
  };

  const confirmarBorrar = () => {
    const id = confirmarId;
    setConfirmarId(null);
    runInBackground(async () => {
      await eliminar(id);
      setPgA(1);
    });
  };

  const redAEliminar = redes.find(r => r.id === confirmarId);
  const saveName = pendingSave?.payload?.nombre || '';

  if (loading) return (
    <div style={{ fontFamily:"var(--font)" }}>
      <Header title={t('links.page.title')} />
      <div style={{ maxWidth:640,margin:"0 auto",padding:"24px 16px 40px" }}>
        <div className="dash-loading dash-loading--inline" role="status" aria-live="polite">
          <span className="dash-loading-spinner" />
          <span>{t('links.loading')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"var(--font)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;}`}</style>

      {/* BANNER */}
      <Header
        title={t('links.page.title')}
        actions={[
          {
            label: t('links.action.add'),
            title: t('links.action.addTitle'),
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

        <p style={{ margin:"0 0 14px",fontSize:13,color:"#6b7280" }}>{t('links.page.subtitle')}</p>

        <div style={{ border:"1.5px solid #93c5fd",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,background:"#fff" }}>
          <div>
            <p style={{ margin:0,fontWeight:700,fontSize:13,color:"#0077b7" }}>{t('links.section.visibleTitle')}</p>
            <p style={{ margin:"2px 0 0",fontSize:12,color:"#6b7280" }}>{secActiva ? t('links.section.visibleDescription') : t('links.section.disabledDescription')}</p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Toggle on={secActiva} onChange={setSecActiva}/>
            <span style={{ fontSize:13,fontWeight:600,minWidth:68,color:secActiva?"#16a34a":"#e85555" }}>{secActiva ? t('links.status.active') : t('links.status.disabled')}</span>
          </div>
        </div>

        {secActiva ? (
          <>
            {activas.length === 0
              ? <div style={{ border:"1.5px dashed #d1d5db",borderRadius:8,padding:"28px",textAlign:"center",color:"#9ca3af",fontSize:13 }}>{t('links.empty.active')}</div>
              : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {pgdA.map(r => <Card key={r.id} red={r} onToggle={handleToggle} onDelete={pedirEliminar} onEdit={handleEdit} isOculta={false}/>)}
                </div>
            }
            <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",marginTop:20,gap:8 }}>
              <div/>
              {activas.length > POR_PAG ? <Pager total={activas.length} page={pgA} perPage={POR_PAG} onChange={setPgA}/> : <div/>}
              <div style={{ display:"flex",justifyContent:"flex-end" }}>
                <button onClick={() => navigate(-1)} style={{ padding:"9px 28px",borderRadius:7,border:"none",background:"#e85555",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>{t('links.action.exit')}</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ border:"1.5px dashed rgba(232,85,85,.3)",borderRadius:8,padding:"14px 22px",textAlign:"center",marginBottom:ocultas.length > 0 ? 14 : 0 }}>
              <p style={{ margin:0,fontWeight:700,color:"#e85555",fontSize:13 }}>{t('links.section.disabledTitle')}</p>
              <p style={{ margin:"4px 0 0",fontSize:12,color:"#9ca3af" }}>{ocultas.length > 0 ? t('links.section.disabledWithHidden') : t('links.section.disabledNoHidden')}</p>
            </div>
            {ocultas.length > 0 && (
              <div style={{ animation:"fadeUp .2s ease both" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                  <span style={{ fontSize:12,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:".5px" }}>{t('links.hidden.title')}</span>
                  <span style={{ fontSize:11,fontWeight:600,padding:"1px 7px",borderRadius:20,background:"#f3f4f6",color:"#6b7280",border:"1px solid #e5e7eb" }}>{ocultas.length}</span>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {pgdO.map(r => <Card key={r.id} red={r} onToggle={handleToggle} onDelete={pedirEliminar} onEdit={handleEdit} isOculta={true}/>)}
                </div>
                {ocultas.length > POR_PAG && <div style={{ marginTop:10 }}><Pager total={ocultas.length} page={pgO} perPage={POR_PAG} onChange={setPgO}/></div>}
              </div>
            )}
            <div style={{ display:"flex",justifyContent:"flex-end",marginTop:20 }}>
              <button onClick={() => navigate(-1)} style={{ padding:"9px 28px",borderRadius:7,border:"none",background:"#e85555",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>{t('links.action.exit')}</button>
            </div>
          </>
        )}
      </div>

      {modal     && <Modal       onClose={() => setModal(false)}    onAdd={handleAdd}/>}
      {redEditar && <ModalEditar onClose={() => setRedEditar(null)} onSave={handleSave} red={redEditar.red} isKnownPlatform={redEditar.isKnownPlatform}/>}
      <ConfirmModal
        open={!!pendingSave}
        title={pendingSave?.mode === 'edit' ? t('links.save.editTitle') : t('links.save.addTitle')}
        subtitle={saveName}
        message={
          pendingSave?.mode === 'edit'
            ? t('links.save.editMessage', { name: saveName })
            : t('links.save.addMessage', { name: saveName })
        }
        confirmLabel={pendingSave?.mode === 'edit' ? t('links.save.editConfirm') : t('links.save.addConfirm')}
        cancelLabel={t('links.action.cancel')}
        variant={pendingSave?.mode === 'edit' ? 'blue' : 'green'}
        icon="check"
        onConfirm={confirmarGuardar}
        onClose={cancelarGuardar}
      />
      <ConfirmModal
        open={!!confirmarId}
        title={t('links.confirm.title')}
        subtitle={redAEliminar?.nombre || ''}
        message={`${t('links.confirm.message')} "${redAEliminar?.nombre || ''}". ${t('links.confirm.warning')}`}
        confirmLabel={t('links.confirm.confirm')}
        cancelLabel={t('links.action.cancel')}
        variant="red"
        icon="warning"
        onConfirm={confirmarBorrar}
        onClose={cancelarBorrar}
      />
      <BackgroundSaveIndicator active={saving} label={t('actions.saving')} />
    </div>
  );
}
