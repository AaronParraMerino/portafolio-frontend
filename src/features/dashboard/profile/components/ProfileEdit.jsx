import { useState, useRef, useEffect } from 'react';
import '../styles/profile.css';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import DashboardEdit, {
  DashboardEditBody,
  DashboardEditFooter,
} from '../../layout/DashboardEdit';

/* ══════════════════════════════════════════════
   DATOS: Países con bandera, código y regex tel
══════════════════════════════════════════════ */
const PAISES = [
  { code: 'BO', name: 'Bolivia',         flag: '🇧🇴', dial: '+591', telRegex: /^\d{8}$/,      telHint: '8 dígitos (ej: 70000000)' },
  { code: 'AR', name: 'Argentina',       flag: '🇦🇷', dial: '+54',  telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'BR', name: 'Brasil',          flag: '🇧🇷', dial: '+55',  telRegex: /^\d{10,11}$/,  telHint: '10-11 dígitos' },
  { code: 'CL', name: 'Chile',           flag: '🇨🇱', dial: '+56',  telRegex: /^\d{9}$/,      telHint: '9 dígitos' },
  { code: 'CO', name: 'Colombia',        flag: '🇨🇴', dial: '+57',  telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'EC', name: 'Ecuador',         flag: '🇪🇨', dial: '+593', telRegex: /^\d{9,10}$/,   telHint: '9-10 dígitos' },
  { code: 'PE', name: 'Perú',           flag: '🇵🇪', dial: '+51',  telRegex: /^\d{9}$/,      telHint: '9 dígitos' },
  { code: 'PY', name: 'Paraguay',        flag: '🇵🇾', dial: '+595', telRegex: /^\d{9}$/,      telHint: '9 dígitos' },
  { code: 'UY', name: 'Uruguay',         flag: '🇺🇾', dial: '+598', telRegex: /^\d{8,9}$/,    telHint: '8-9 dígitos' },
  { code: 'VE', name: 'Venezuela',       flag: '🇻🇪', dial: '+58',  telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'MX', name: 'México',         flag: '🇲🇽', dial: '+52',  telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'US', name: 'Estados Unidos',  flag: '🇺🇸', dial: '+1',   telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'CA', name: 'Canadá',         flag: '🇨🇦', dial: '+1',   telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'ES', name: 'España',         flag: '🇪🇸', dial: '+34',  telRegex: /^\d{9}$/,      telHint: '9 dígitos' },
  { code: 'DE', name: 'Alemania',        flag: '🇩🇪', dial: '+49',  telRegex: /^\d{10,11}$/,  telHint: '10-11 dígitos' },
  { code: 'FR', name: 'Francia',         flag: '🇫🇷', dial: '+33',  telRegex: /^\d{9}$/,      telHint: '9 dígitos' },
  { code: 'IT', name: 'Italia',          flag: '🇮🇹', dial: '+39',  telRegex: /^\d{9,10}$/,   telHint: '9-10 dígitos' },
  { code: 'GB', name: 'Reino Unido',     flag: '🇬🇧', dial: '+44',  telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'PT', name: 'Portugal',        flag: '🇵🇹', dial: '+351', telRegex: /^\d{9}$/,      telHint: '9 dígitos' },
  { code: 'CN', name: 'China',           flag: '🇨🇳', dial: '+86',  telRegex: /^\d{11}$/,     telHint: '11 dígitos' },
  { code: 'JP', name: 'Japón',          flag: '🇯🇵', dial: '+81',  telRegex: /^\d{10,11}$/,  telHint: '10-11 dígitos' },
  { code: 'KR', name: 'Corea del Sur',   flag: '🇰🇷', dial: '+82',  telRegex: /^\d{9,10}$/,   telHint: '9-10 dígitos' },
  { code: 'IN', name: 'India',           flag: '🇮🇳', dial: '+91',  telRegex: /^\d{10}$/,     telHint: '10 dígitos' },
  { code: 'AU', name: 'Australia',       flag: '🇦🇺', dial: '+61',  telRegex: /^\d{9}$/,      telHint: '9 dígitos' },
  { code: 'OTHER', name: 'Otro país',    flag: '🌍',  dial: '',    telRegex: /^\d{6,15}$/,   telHint: '6-15 dígitos' },
];

const INVALID_CHARS_NAME = /[0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/;
const INVALID_CHARS_TEXT = /[<>{}[\]\\]/;

function validateField(name, value, form) {
  switch (name) {
    case 'nombre':
      if (!value.trim()) return 'El nombre es obligatorio.';
      if (value.trim().length < 2) return 'Mínimo 2 caracteres.';
      if (INVALID_CHARS_NAME.test(value)) return 'No se permiten números ni caracteres especiales.';
      if (value.length > 50) return 'Máximo 50 caracteres.';
      return '';
    case 'apellido':
      if (!value.trim()) return 'El apellido es obligatorio.';
      if (value.trim().length < 2) return 'Mínimo 2 caracteres.';
      if (INVALID_CHARS_NAME.test(value)) return 'No se permiten números ni caracteres especiales.';
      if (value.length > 50) return 'Máximo 50 caracteres.';
      return '';
    case 'profesion':
      if (value && INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos: < > { } [ ]';
      if (value.length > 80) return 'Máximo 80 caracteres.';
      return '';
    case 'biografia':
      if (value && INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos: < > { } [ ]';
      if (value.length > 500) return `Máximo 500 caracteres (${value.length}/500).`;
      return '';
    case 'ciudad':
      if (/\d/.test(value)) return 'No se permiten números, solo letras.';
      if (value && INVALID_CHARS_TEXT.test(value)) return 'Caracteres no permitidos.';
      if (value.length > 60) return 'Máximo 60 caracteres.';
      return '';
    case 'telefono': {
      if (!value.trim()) return '';
      const onlyDigits = value.replace(/\s/g, '');
      if (!/^\d+$/.test(onlyDigits)) return 'Solo se permiten dígitos (sin guiones ni paréntesis).';
      const pais = PAISES.find(p => p.code === form.paisCode);
      if (pais && !pais.telRegex.test(onlyDigits))
        return `Número inválido para ${pais.name}. ${pais.telHint}.`;
      return '';
    }
    default: return '';
  }
}

/* ── Dropdown País ── */
function PaisDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);
  const selected = PAISES.find(p => p.code === value) || null;
  const filtered = PAISES.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.dial.includes(search)
  );
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button"
        className="form-control dash-edit-input prf-input prf-country-btn"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox" aria-expanded={open}
      >
        {selected ? (
          <>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{selected.flag}</span>
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</span>
            <span style={{ fontSize: 11, color: 'var(--gris-texto)', flexShrink: 0 }}>{selected.dial}</span>
          </>
        ) : <span style={{ color: 'var(--gris-texto)' }}>Seleccionar país…</span>}
        <svg viewBox="0 0 10 6" style={{ width: 10, height: 10, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0, marginLeft: 4, transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M1 1l4 4 4-4"/>
        </svg>
      </button>
      {open && (
        <div className="prf-country-dropdown" role="listbox">
          <div className="prf-country-search-wrap">
            <svg viewBox="0 0 14 14" style={{ width: 13, height: 13, stroke: 'var(--gris-texto)', fill: 'none', strokeWidth: 1.8, flexShrink: 0 }}>
              <circle cx="6" cy="6" r="4.5"/><path d="M10 10l2.5 2.5"/>
            </svg>
            <input ref={searchRef} className="prf-country-search" placeholder="Buscar país o código..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <ul className="prf-country-list">
            {filtered.length === 0 && <li className="prf-country-empty">Sin resultados</li>}
            {filtered.map(p => (
              <li key={p.code} role="option" aria-selected={value === p.code}
                className={`prf-country-item${value === p.code ? ' selected' : ''}`}
                onMouseDown={() => { onChange(p); setOpen(false); setSearch(''); }}
              >
                <span style={{ fontSize: 18 }}>{p.flag}</span>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: 'var(--gris-texto)' }}>{p.dial}</span>
                {value === p.code && (
                  <svg viewBox="0 0 12 12" style={{ width: 12, height: 12, stroke: 'var(--azul)', fill: 'none', strokeWidth: 2.2 }}><path d="M2 6l3 3 5-5"/></svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="dash-edit-field-error prf-field-error" role="alert">
      <svg viewBox="0 0 12 12" style={{ width: 11, height: 11, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
        <circle cx="6" cy="6" r="5"/><path d="M6 3.5v3M6 8.5v.5"/>
      </svg>
      {msg}
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
export default function ProfileEdit({ perfil, onGuardar, onCancelar, guardando }) {

  const detectDialCode = () => {
    if (!perfil?.telefono) return 'BO';
    for (const p of PAISES) { if (p.dial && perfil.telefono.startsWith(p.dial)) return p.code; }
    return 'BO';
  };
  const stripDial = (tel, paisCode) => {
    const p = PAISES.find(x => x.code === paisCode);
    if (p?.dial && tel?.startsWith(p.dial)) return tel.slice(p.dial.length).trim();
    return tel || '';
  };

  const initPaisCode = detectDialCode();
  const [form, setForm] = useState({
    nombre:    perfil?.nombre    || '',
    apellido:  perfil?.apellido  || '',
    profesion: perfil?.profesion || '',
    biografia: perfil?.biografia || '',
    correo:    perfil?.correo    || '',
    paisCode:  initPaisCode,
    ciudad:    perfil?.ciudad    || '',
    telefono:  stripDial(perfil?.telefono, initPaisCode),
  });
  const [touched,         setTouched]         = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmPending,  setConfirmPending]  = useState(null);

  const errors = {};
  ['nombre','apellido','profesion','biografia','ciudad','telefono'].forEach(f => {
    errors[f] = validateField(f, form[f], form);
  });
  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  const handleBlur   = (e) => setTouched(prev => ({ ...prev, [e.target.name]: true }));
  const handlePaisChange = (pais) => {
    setForm(prev => ({ ...prev, paisCode: pais.code }));
    setTouched(prev => ({ ...prev, paisCode: true }));
  };
  const showError = (f) => (touched[f] || submitAttempted) && errors[f];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ nombre: true, apellido: true, profesion: true, biografia: true, ciudad: true, telefono: true });
    if (hasErrors) return;

    const paisObj = PAISES.find(p => p.code === form.paisCode);
    const telCompleto = form.telefono.trim() ? `${paisObj?.dial || ''}${form.telefono.trim()}` : '';
    setConfirmPending({
      nombre:    form.nombre.trim(),
      apellido:  form.apellido.trim(),
      profesion: form.profesion.trim(),
      biografia: form.biografia.trim(),
      correo:    form.correo.trim(),
      pais:      paisObj?.name || '',
      ciudad:    form.ciudad.trim(),
      telefono:  telCompleto,
    });
  };

  const handleConfirmar = () => {
    if (confirmPending) { onGuardar(confirmPending); setConfirmPending(null); }
  };

  const paisObj = PAISES.find(p => p.code === form.paisCode);

  return (
    <>
      <DashboardEdit
        title="Editar perfil"
        subtitle="Los cambios se reflejan en tu vista publica"
        onClose={onCancelar}
        closeDisabled={guardando}
        closeOnOverlay={!guardando}
        size="lg"
        ariaLabel="Editar perfil"
      >
          {submitAttempted && hasErrors && (
            <div className="dash-edit-banner-error prf-global-error-banner" role="alert">
              <svg viewBox="0 0 14 14" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
                <path d="M7 1L1 12h12L7 1z"/><path d="M7 5.5v3M7 10v.5"/>
              </svg>
              Revisa los campos marcados antes de guardar.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'contents' }} autoComplete="off" noValidate>
            <DashboardEditBody>

              <div className="prf-form-section">
                <span className="prf-section-label">Información básica</span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="prf-label">Nombre <span className="prf-required-star">*</span></label>
                    <input className={`form-control dash-edit-input prf-input${showError('nombre') ? ' dash-edit-input-error prf-input-error' : ''}`}
                      name="nombre" value={form.nombre} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Tu nombre" autoComplete="given-name" maxLength={51} />
                    <FieldError msg={showError('nombre')} />
                  </div>
                  <div className="col-md-6">
                    <label className="prf-label">Apellido <span className="prf-required-star">*</span></label>
                    <input className={`form-control dash-edit-input prf-input${showError('apellido') ? ' dash-edit-input-error prf-input-error' : ''}`}
                      name="apellido" value={form.apellido} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Tu apellido" autoComplete="family-name" maxLength={51} />
                    <FieldError msg={showError('apellido')} />
                  </div>
                  <div className="col-md-6">
                    <label className="prf-label">Profesión</label>
                    <input className={`form-control dash-edit-input prf-input${showError('profesion') ? ' dash-edit-input-error prf-input-error' : ''}`}
                      name="profesion" value={form.profesion} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Ej: Dev Full Stack" autoComplete="organization-title" maxLength={81} />
                    <FieldError msg={showError('profesion')} />
                  </div>
                  <div className="col-12">
                    <label className="prf-label">
                      Acerca de mí
                      <span className="prf-char-count" style={{ color: form.biografia.length > 480 ? 'var(--rojo-soft)' : 'var(--gris-texto)' }}>
                        {form.biografia.length}/500
                      </span>
                    </label>
                    <textarea className={`form-control dash-edit-textarea prf-input${showError('biografia') ? ' dash-edit-input-error prf-input-error' : ''}`}
                      name="biografia" value={form.biografia} onChange={handleChange} onBlur={handleBlur}
                      rows={3} placeholder="Cuéntanos sobre ti..." autoComplete="off" maxLength={501} />
                    <FieldError msg={showError('biografia')} />
                  </div>
                </div>
              </div>

              <div className="prf-form-section">
                <span className="prf-section-label">Contacto</span>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="prf-label">País</label>
                    <PaisDropdown value={form.paisCode} onChange={handlePaisChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="prf-label">Ciudad</label>
                    <input className={`form-control dash-edit-input prf-input${showError('ciudad') ? ' dash-edit-input-error prf-input-error' : ''}`}
                      name="ciudad" value={form.ciudad} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Cochabamba" autoComplete="address-level2" maxLength={61} />
                    <FieldError msg={showError('ciudad')} />
                  </div>
                  <div className="col-md-4">
                    <label className="prf-label">Teléfono</label>
                    <div className={`prf-tel-wrap${showError('telefono') ? ' prf-input-error-wrap' : ''}`}>
                      <div className="prf-tel-code" title={paisObj?.name}>
                        <span style={{ fontSize: 16 }}>{paisObj?.flag}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--azul)' }}>{paisObj?.dial}</span>
                      </div>
                      <input className="prf-tel-input" name="telefono" value={form.telefono}
                        onChange={handleChange} onBlur={handleBlur}
                        placeholder={paisObj?.telHint?.split(' ')[0] || '00000000'}
                        autoComplete="tel-national" inputMode="numeric" maxLength={16} />
                    </div>
                    {!showError('telefono') && paisObj && (
                      <div className="prf-field-hint">{paisObj.telHint} — el código {paisObj.dial} se añade automáticamente</div>
                    )}
                    <FieldError msg={showError('telefono')} />
                  </div>
                </div>
              </div>

            </DashboardEditBody>

            <DashboardEditFooter>
              <button type="button" className="dash-edit-btn dash-edit-btn--secondary" onClick={onCancelar} disabled={guardando}>Cancelar</button>
              <button type="submit" className="dash-edit-btn dash-edit-btn--primary" disabled={guardando}>
                {guardando
                  ? <><span className="dash-edit-spinner" /> Guardando...</>
                  : <><svg viewBox="0 0 14 14"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" fill="none" strokeWidth="2.2"/></svg>Guardar cambios</>
                }
              </button>
            </DashboardEditFooter>
          </form>

      </DashboardEdit>

      <ConfirmModal
        open={!!confirmPending}
        title="¿Guardar cambios?"
        message="Estás por actualizar tu información de perfil. Los cambios se reflejarán en tu vista pública de inmediato."
        confirmLabel="Sí, guardar"
        variant="blue"
        icon="check"
        loading={guardando}
        onConfirm={handleConfirmar}
        onClose={() => !guardando && setConfirmPending(null)}
      />
    </>
  );
}
