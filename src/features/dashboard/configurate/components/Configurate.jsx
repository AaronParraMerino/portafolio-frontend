import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../layout/Header";

export default function Configurate() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (route) => {
    navigate(`/dashboard/settings/${route}`);
  };

  return (
    <div style={{ fontFamily: "var(--font)", minHeight: '100vh', background: '#effaff' }}>
      <Header
        eyebrow="CUENTA"
        title="Configuracion"
        subtitle="Gestiona ajustes de cuenta, seguridad y accesos."
      />

      {/* ── SECCIÓN DE ABAJO ── */}
      <div style={{ background: '#effaff', padding: isMobile ? '24px 14px 40px' : '36px 24px 48px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Gestión de cuenta */}
          <div style={sectionLabelStyle}>
            <span style={labelTextStyle}>Gestión de cuenta</span>
            <div style={dividerStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Vincular cuenta */}
            <button style={cardStyle} onClick={() => handleClick('vincular-cuenta')}>
              <div style={cardLeftStyle}>
                <div style={iconWrapStyle}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <div>
                  <h3 style={cardTitleStyle}>Vincular cuenta</h3>
                  <p style={cardTextStyle}>Conecta Google, Discord, GitHub y GitLab.</p>
                </div>
              </div>
              <div style={arrowStyle}>›</div>
            </button>

            {/* Cambiar contraseña */}
            <button style={cardStyle} onClick={() => handleClick('cambiar-contraseña')}>
              <div style={cardLeftStyle}>
                <div style={iconWrapStyle}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <h3 style={cardTitleStyle}>Cambiar contraseña</h3>
                  <p style={cardTextStyle}>Actualiza tu contraseña de acceso de forma segura.</p>
                </div>
              </div>
              <div style={arrowStyle}>›</div>
            </button>

            {/* Sesiones activas */}
            <button style={cardStyle} onClick={() => handleClick('sesiones-activas')}>
              <div style={cardLeftStyle}>
                <div style={iconWrapStyle}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div>
                  <h3 style={cardTitleStyle}>Cerrar sesión en dispositivos</h3>
                  <p style={cardTextStyle}>Administra sesiones activas en otros dispositivos.</p>
                </div>
              </div>
              <div style={arrowStyle}>›</div>
            </button>
          </div>

          {/* Zona de peligro */}
          <div style={{ ...sectionLabelStyle, marginTop: 10 }}>
            <span style={{ ...labelTextStyle, color: '#ef4444' }}>Zona de peligro</span>
            <div style={{ ...dividerStyle, background: '#fecaca' }} />
          </div>

          <button
            style={{
              ...cardStyle,
              border: '1px solid #fecaca',
              background: '#fff1f2',
              boxShadow: '0 8px 20px rgba(239,68,68,0.10)',
            }}
            onClick={() => handleClick('eliminar-cuenta')}
          >
            <div style={cardLeftStyle}>
              <div style={{ ...iconWrapStyle, background: '#fee2e2', border: '1px solid #fca5a5' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <div>
                <h3 style={{ ...cardTitleStyle, color: '#ef4444' }}>Eliminar cuenta</h3>
                <p style={cardTextStyle}>Esta acción es permanente e irreversible.</p>
              </div>
            </div>
            <div style={{ ...arrowStyle, background: '#ffe4e6', color: '#ef4444', boxShadow: 'none' }}>›</div>
          </button>

        </div>
      </div>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────

const sectionLabelStyle = {
  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
};

const labelTextStyle = {
  fontSize: 11, fontWeight: 800, color: '#64748b',
  letterSpacing: 3, textTransform: 'uppercase', whiteSpace: 'nowrap',
};

const dividerStyle = {
  height: 1, flex: 1, minWidth: 80, background: '#bae6fd',
};

const cardStyle = {
  width: '100%',
  border: '1px solid #bae6fd',
  background: '#ffffff',
  borderRadius: 20,
  padding: '20px 22px',          // más alto que antes
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 8px 20px rgba(14,165,233,0.09)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'transform 0.15s, box-shadow 0.15s',
};

const cardLeftStyle = {
  display: 'flex', alignItems: 'center', gap: 18,
};

const iconWrapStyle = {
  width: 52, height: 52,         // más grande que antes (era 42)
  borderRadius: 14,
  background: '#d8f1ff',
  border: '1px solid #a7ddff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

const cardTitleStyle = {
  margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b',  // era 15
};

const cardTextStyle = {
  margin: '5px 0 0', fontSize: 13.5, color: '#64748b',         // era 13
};

const arrowStyle = {
  width: 34, height: 34,         // más grande que antes (era 28)
  borderRadius: 10,
  background: '#0ea5e9', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 22,
  boxShadow: '0 6px 14px rgba(14,165,233,0.35)',
  flexShrink: 0,
};
