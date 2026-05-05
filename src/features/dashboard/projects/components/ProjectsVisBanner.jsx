// import '../styles/projects.css';

// /* ════════════════════════════════════════
//    ProjectsVisBanner
//    src/features/dashboard/projects/components/ProjectsVisBanner.jsx

//    Banner con toggle de visibilidad global del portafolio.

//    Props:
//    ─ visible    bool
//    ─ onToggle   fn()
// ════════════════════════════════════════ */
// export default function ProjectsVisBanner({ visible, onToggle }) {
//   return (
//     <div className={`prj-vis-banner${!visible ? ' privado' : ''}`}>
//       <button
//         className={`prj-toggle-pill${!visible ? ' off' : ''}`}
//         type="button"
//         onClick={onToggle}
//         title={visible ? 'Ocultar portafolio' : 'Publicar portafolio'}
//         aria-label={visible ? 'Ocultar portafolio' : 'Publicar portafolio'}
//       />
//       <div className="prj-banner-info">
//         <div className="prj-banner-title">Visibilidad del portafolio</div>
//         <div className="prj-banner-sub">
//           {visible
//             ? 'Tu portafolio es visible para empresas y reclutadores'
//             : 'Tu portafolio está oculto — nadie puede verlo'}
//         </div>
//       </div>
//       <div className="prj-banner-stat">
//         <div className="prj-b-dot" />
//         {visible ? 'Público' : 'Privado'}
//       </div>
//     </div>
//   );
// }