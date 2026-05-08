import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CambiarContraseña() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    console.log("Actualizar contraseña:", form);
  };

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <div style={badgeStyle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Seguridad
        </div>

        <h1 style={titleStyle}>Cambiar contraseña</h1>
        <p style={subtitleStyle}>Elige una contraseña segura y no la reutilices en otros sitios.</p>

        <div style={cardStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Contraseña actual</label>
            <input type="password" name="actual" value={form.actual} onChange={handleChange}
              placeholder="••••••••••" style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, { borderColor: '#bae6fd', boxShadow: 'none' })} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nueva contraseña</label>
            <input type="password" name="nueva" value={form.nueva} onChange={handleChange}
              placeholder="••••••••••" style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, { borderColor: '#bae6fd', boxShadow: 'none' })} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Confirmar nueva contraseña</label>
            <input type="password" name="confirmar" value={form.confirmar} onChange={handleChange}
              placeholder="••••••••••" style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, { borderColor: '#bae6fd', boxShadow: 'none' })} />
          </div>
          <div style={actionsStyle}>
            <button style={btnPrimaryStyle} onClick={handleSubmit}>Actualizar contraseña</button>
            <button style={btnCancelStyle} onClick={() => navigate('/dashboard/settings')}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { fontFamily: "'Segoe UI','Inter',sans-serif", background: '#ffffff', minHeight: '100vh', padding: '36px 24px' };
const innerStyle = { maxWidth: 680, margin: '0 auto', width: '100%' };
const badgeStyle = { display: 'inline-flex', alignItems: 'center', gap: 7, border: '1.5px solid #93c5fd', borderRadius: 999, padding: '5px 14px', background: '#eff8ff', fontSize: 12, fontWeight: 700, color: '#1e40af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 18 };
const titleStyle = { fontSize: 34, fontWeight: 900, color: '#0f172a', fontFamily: "Georgia,'Times New Roman',serif", marginBottom: 10, lineHeight: 1.1 };
const subtitleStyle = { fontSize: 14, color: '#475569', marginBottom: 28 };
const cardStyle = { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 18, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 7 };
const labelStyle = { fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: 2, textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '13px 16px', border: '1.5px solid #bae6fd', borderRadius: 10, background: '#ffffff', fontSize: 15, color: '#1e293b', outline: 'none' };
const inputFocusStyle = { borderColor: '#38bdf8', boxShadow: '0 0 0 3px rgba(56,189,248,0.15)' };
const actionsStyle = { display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 };
const btnPrimaryStyle = { background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(14,165,233,0.3)' };
const btnCancelStyle = { background: 'transparent', color: '#374151', border: '1.5px solid #d1d5db', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' };