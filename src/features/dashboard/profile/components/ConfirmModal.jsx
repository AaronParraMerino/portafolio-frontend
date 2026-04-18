// /* ══════════════════════════════════════════════
//    ConfirmModal
// ══════════════════════════════════════════════ */
// export default function ConfirmModal({
//   title       = '¿Confirmar acción?',
//   message     = '¿Estás seguro de que deseas continuar?',
//   confirmLabel = 'Confirmar',
//   variant      = 'blue',
//   icon         = 'check',
//   loading      = false,
//   onConfirm,
//   onClose,
// }) {
//   const btnStyle = variant === 'red'
//     ? { background: 'var(--rojo-soft)' }
//     : {};

//   const iconBg = variant === 'red'
//     ? { background: 'var(--rojo-bg)', border: '1.5px solid var(--rojo-borde)' }
//     : { background: 'var(--azul-light)', border: '1.5px solid var(--azul-mid)' };

//   const iconColor = variant === 'red' ? 'var(--rojo-soft)' : 'var(--azul)';

//   return (
//     <div
//       className="prf-modal-overlay"
//       style={{ zIndex: 600 }}           /* Por encima del modal padre */
//       onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
//     >
//       <div className="prf-modal" style={{ maxWidth: 400 }}>

//         {/* ── Cabecera ── */}
//         <div className="prf-modal-head">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

//             {/* Ícono */}
//             <div style={{
//               width: 36, height: 36, borderRadius: 9,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               flexShrink: 0,
//               ...iconBg,
//             }}>
//               {icon === 'warning' ? (
//                 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={iconColor} strokeWidth="1.8">
//                   <path d="M8 1.5L14.5 13H1.5L8 1.5z"/>
//                   <path d="M8 6v3.5"/>
//                   <circle cx="8" cy="11.5" r=".6" fill={iconColor}/>
//                 </svg>
//               ) : (
//                 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={iconColor} strokeWidth="2">
//                   <path d="M3 8l3.5 3.5L13 4"/>
//                 </svg>
//               )}
//             </div>

//             <div>
//               <div className="prf-modal-title">{title}</div>
//               <div className="prf-modal-sub">Esta acción requiere confirmación.</div>
//             </div>
//           </div>

//           <button
//             className="prf-modal-close"
//             onClick={onClose}
//             disabled={loading}
//             title="Cerrar"
//           >
//             <svg viewBox="0 0 12 12">
//               <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none" strokeWidth="2.2"/>
//             </svg>
//           </button>
//         </div>

//         {/* ── Cuerpo ── */}
//         <div className="prf-modal-body" style={{ padding: '18px 22px' }}>
//           <p style={{ fontSize: 13, color: 'var(--gris-oscuro)', lineHeight: 1.6, margin: 0 }}>
//             {message}
//           </p>
//         </div>

//         {/* ── Pie ── */}
//         <div className="prf-modal-foot">
//           <button
//             className="prf-btn-cancel"
//             onClick={onClose}
//             disabled={loading}
//           >
//             Cancelar
//           </button>
//           <button
//             className="prf-btn-save"
//             style={btnStyle}
//             onClick={onConfirm}
//             disabled={loading}
//           >
//             {loading ? (
//               <><span className="prf-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Guardando...</>
//             ) : (
//               <>
//                 {icon === 'check' ? (
//                   <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2">
//                     <path d="M2 7l3.5 3.5L12 3"/>
//                   </svg>
//                 ) : (
//                   <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M7 1L1 12h12L7 1z"/>
//                     <path d="M7 5.5v3M7 10v.5"/>
//                   </svg>
//                 )}
//                 {confirmLabel}
//               </>
//             )}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }