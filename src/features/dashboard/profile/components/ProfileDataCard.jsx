import '../styles/profile.css';

/*
  ProfileDataCard
  ───────────────
  Muestra los datos de contacto del usuario
  directamente debajo del ProfileHeader,
  con el nombre + profesión arriba y los campos
  de contacto en un grid de inputs de solo lectura.
  El ícono de lápiz abre el modal de edición.
*/
export default function ProfileDataCard({ perfil, onEditar }) {
  return (
    <div className="prf-datacard">

      {/* ── Nombre + profesión + botón editar ── */}
      <div className="prf-card-head">
        <span className="prf-card-title">Datos personales</span>
      </div>

      {/* ── Separador ── */}
      <div className="prf-datacard-divider" />

      {/* ── Campos de contacto en grid ── */}
      <div className="prf-datacard-fields">

        <div className="prf-datacard-field">
          <label className="prf-datacard-label">Correo electrónico</label>
          <div className="prf-datacard-value">
            {perfil.correo || <span className="prf-datacard-empty">Sin completar</span>}
          </div>
        </div>

        <div className="prf-datacard-field">
          <label className="prf-datacard-label">País</label>
          <div className="prf-datacard-value">
            {perfil.pais || <span className="prf-datacard-empty">—</span>}
          </div>
        </div>

        <div className="prf-datacard-field">
          <label className="prf-datacard-label">Ciudad</label>
          <div className="prf-datacard-value">
            {perfil.ciudad || <span className="prf-datacard-empty">—</span>}
          </div>
        </div>

        <div className="prf-datacard-field">
          <label className="prf-datacard-label">Profesión</label>
          <div className="prf-datacard-value">
            {perfil.profesion || <span className="prf-datacard-empty">Sin completar</span>}
          </div>
        </div>

        <div className="prf-datacard-field">
          <label className="prf-datacard-label">Teléfono</label>
          <div className="prf-datacard-value">
            {perfil.telefono || <span className="prf-datacard-empty">Sin completar</span>}
          </div>
        </div>

        <div className="prf-datacard-field prf-datacard-field--full">
          <label className="prf-datacard-label">Acerca de mí</label>
          <div className="prf-datacard-value prf-datacard-value--bio">
            {perfil.biografia || <span className="prf-datacard-empty">Sin completar</span>}
          </div>
        </div>

      </div>
    </div>
  );
}