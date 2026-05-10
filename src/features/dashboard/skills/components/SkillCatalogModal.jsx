import { useState } from "react";
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFieldError,
  DashboardEditFooter,
  DashboardEditSection,
  DashboardEditSpinner,
} from "../../layout/DashboardEdit";
import { createCatalogSkill } from "../services/skillService";

export default function SkillCatalogModal({ tipo, onSave, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [desc, setDesc] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError("");
    setConfirmar(true);
  };

  const handleFinalConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      const nuevaHabilidad = await createCatalogSkill(
        nombre.trim(),
        tipo,
        desc.trim()
      );

      onSave(nuevaHabilidad);
    } catch (err) {
      setError(err.message || "Error al crear habilidad en catalogo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardEdit
      title={`Nueva habilidad ${tipo === "tecnica" ? "tecnica" : "blanda"}`}
      subtitle="Se agregara al catalogo general para poder seleccionarla."
      onClose={onCancel}
      closeDisabled={loading}
      closeOnOverlay={!loading}
      size="sm"
      className="dash-edit-modal--stacked"
      ariaLabel="Nueva habilidad"
    >
      {!confirmar ? (
        <form onSubmit={handleSubmit} style={{ display: "contents" }}>
          <DashboardEditBody>
            <DashboardEditSection label="Datos del catalogo">
              <div className="dash-edit-field mb-3">
                <label className="dash-edit-label">Nombre de la habilidad <span className="dash-edit-required">*</span></label>
                <input
                  type="text"
                  className="form-control dash-edit-input"
                  placeholder="Ej: AWS, Scrum..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="dash-edit-field">
                <label className="dash-edit-label">
                  Pequena descripcion
                  <span className="dash-edit-char-count" style={{ color: "var(--gris-texto)" }}>
                    {desc.length}/30
                  </span>
                </label>
                <textarea
                  className="form-control dash-edit-textarea"
                  rows="2"
                  maxLength="30"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ej: Servicios cloud"
                  disabled={loading}
                />
              </div>

              <DashboardEditFieldError msg={error} />
            </DashboardEditSection>
          </DashboardEditBody>

          <DashboardEditFooter>
            <button
              type="button"
              className="dash-edit-btn dash-edit-btn--secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="dash-edit-btn dash-edit-btn--primary"
              disabled={loading}
            >
              Crear en catalogo
            </button>
          </DashboardEditFooter>
        </form>
      ) : (
        <>
          <DashboardEditBody>
            <div className="dash-edit-confirm">
              <p>
                Estas por crear <strong>{nombre}</strong> en el catalogo general.
              </p>
              <DashboardEditFieldError msg={error} />
            </div>
          </DashboardEditBody>

          <DashboardEditFooter>
            <button
              type="button"
              className="dash-edit-btn dash-edit-btn--secondary"
              onClick={() => setConfirmar(false)}
              disabled={loading}
            >
              Atras
            </button>
            <button
              type="button"
              className="dash-edit-btn dash-edit-btn--primary"
              onClick={handleFinalConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <DashboardEditSpinner />
                  Creando...
                </>
              ) : "Si, crear"}
            </button>
          </DashboardEditFooter>
        </>
      )}
    </DashboardEdit>
  );
}
