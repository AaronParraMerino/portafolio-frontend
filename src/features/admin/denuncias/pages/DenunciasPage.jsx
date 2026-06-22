import { useEffect, useMemo, useState } from 'react';
import AdminHeader from '../../layout/AdminHeader';
import AdminPagination, { buildAdminPaginationItems } from '../../shared/AdminPagination';
import {
  DENUNCIA_STATUS,
  DENUNCIA_STATUS_META,
  fetchAdminDenuncias,
  updateAdminDenuncia,
} from '../services/denunciasService';
import '../styles/denuncias.css';

const INITIAL_META = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
};

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusMeta(status) {
  return DENUNCIA_STATUS_META[status] || DENUNCIA_STATUS_META.pendiente;
}

function getUserLabel(user) {
  return user?.nombre || user?.correo || 'Usuario';
}

function getEvidenceImages(evidencia) {
  return Array.isArray(evidencia)
    ? evidencia.filter((item) => item?.tipo === 'imagen' && item?.url)
    : [];
}

export default function DenunciasPage() {
  const [filters, setFilters] = useState({ estado: 'todos', q: '', page: 1, per_page: 12 });
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(INITIAL_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [nextStatus, setNextStatus] = useState('en_revision');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const stats = useMemo(() => {
    const base = { pendiente: 0, en_revision: 0, resuelta: 0, descartada: 0 };
    items.forEach((item) => {
      if (base[item.estado] !== undefined) base[item.estado] += 1;
    });
    return base;
  }, [items]);

  const loadDenuncias = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await fetchAdminDenuncias(filters);
      setItems(payload?.data?.items || []);
      setMeta(payload?.data?.meta || INITIAL_META);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar las denuncias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDenuncias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.estado, filters.q, filters.page, filters.per_page]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const openDetail = (item) => {
    setSelected(item);
    setNextStatus(item.estado === 'pendiente' ? 'en_revision' : item.estado);
    setResponseText(item.respuesta_admin || '');
    setNotice('');
  };

  const saveDetail = async () => {
    if (!selected) return;

    setSaving(true);
    setNotice('');

    try {
      const payload = await updateAdminDenuncia(selected.id_denuncia, {
        estado: nextStatus,
        respuesta_admin: responseText,
      });
      const updated = payload?.data;
      setSelected(updated);
      setItems((current) => current.map((item) => (
        item.id_denuncia === updated.id_denuncia ? updated : item
      )));
      setNotice(payload?.message || 'Denuncia actualizada.');
    } catch (requestError) {
      setNotice(requestError.message || 'No se pudo actualizar la denuncia.');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = meta.last_page || 1;
  const currentPage = meta.current_page || filters.page || 1;
  const paginationSummary = meta.total
    ? `${meta.total} denuncias registradas`
    : (loading ? 'Cargando denuncias...' : 'Sin denuncias registradas');

  return (
    <div className="den-page adm-page-shell">
      <AdminHeader
        eyebrow="Soporte"
        title="Reportes de usuarios"
        subtitle="Bandeja administrativa de solicitudes, reportes y evidencias enviadas desde la plataforma."
      />

      <div className="den-content">
        <section className="den-stats-grid" aria-label="Resumen de denuncias">
          {['pendiente', 'en_revision', 'resuelta', 'descartada'].map((status) => {
            const statusMeta = getStatusMeta(status);
            return (
              <article key={status} className={`den-stat den-stat--${statusMeta.tone}`}>
                <span>{statusMeta.label}</span>
                <strong>{stats[status] || 0}</strong>
              </article>
            );
          })}
        </section>

        {error ? <div className="den-error" role="alert">{error}</div> : null}

        <section className="den-panel">
          <div className="den-panel-head">
            <div>
              <span>Revision administrativa</span>
              <h3>Reportes recibidos</h3>
            </div>
            <button type="button" onClick={loadDenuncias} disabled={loading}>
              Actualizar
            </button>
          </div>

          <div className="den-filters">
            <input
              type="search"
              value={filters.q}
              placeholder="Buscar por asunto, detalle o usuario"
              onChange={(event) => updateFilter('q', event.target.value)}
            />
            <select
              value={filters.estado}
              onChange={(event) => updateFilter('estado', event.target.value)}
            >
              {DENUNCIA_STATUS.map((status) => (
                <option key={status.id} value={status.id}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="den-table-wrap">
            <table className="den-table">
              <thead>
                <tr>
                  <th>Asunto</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="den-empty">Cargando denuncias...</td></tr>
                ) : items.length ? items.map((item) => {
                  const statusMeta = getStatusMeta(item.estado);
                  return (
                    <tr key={item.id_denuncia}>
                      <td>
                        <strong>{item.asunto}</strong>
                        <small>{item.detalle || 'Sin detalle'}</small>
                      </td>
                      <td>
                        <strong>{getUserLabel(item.denunciante)}</strong>
                        <small>{item.denunciante?.correo || 'Sin correo'}</small>
                      </td>
                      <td>
                        <span className={`den-status den-status--${statusMeta.tone}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <button type="button" className="den-row-action" onClick={() => openDetail(item)}>
                          Revisar
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" className="den-empty">No hay denuncias para este filtro.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            summary={paginationSummary}
            currentPage={currentPage}
            totalPages={totalPages}
            paginationItems={buildAdminPaginationItems(currentPage, totalPages)}
            previousLabel="Anterior"
            nextLabel="Siguiente"
            disabled={loading}
            onPageChange={(page) => updateFilter('page', page)}
          />
        </section>
      </div>

      {selected ? (
        <div className="den-detail-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <aside className="den-detail" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>Denuncia #{selected.id_denuncia}</span>
                <h3>{selected.asunto}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar">x</button>
            </header>

            <div className="den-detail-body">
              <section>
                <h4>Detalle</h4>
                <p>{selected.detalle || 'Sin detalle.'}</p>
              </section>

              <section>
                <h4>Denunciante</h4>
                <p>{getUserLabel(selected.denunciante)}<br />{selected.denunciante?.correo || 'Sin correo'}</p>
              </section>

              {selected.metadata?.url ? (
                <section>
                  <h4>Contexto</h4>
                  <a href={selected.metadata.url} target="_blank" rel="noreferrer">
                    {selected.metadata.ruta || selected.metadata.url}
                  </a>
                </section>
              ) : null}

              {getEvidenceImages(selected.evidencia).length ? (
                <section>
                  <h4>Evidencia</h4>
                  <div className="den-evidence-grid">
                    {getEvidenceImages(selected.evidencia).map((item, index) => (
                      <a
                        key={`${item.url}-${index}`}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="den-evidence"
                      >
                        <img src={item.url} alt={item.nombre || `Evidencia ${index + 1}`} />
                        <span>{item.nombre || 'Imagen adjunta'}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              <label>
                <span>Estado</span>
                <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
                  {DENUNCIA_STATUS.filter((status) => status.id !== 'todos').map((status) => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Respuesta para el usuario</span>
                <textarea
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                  rows={6}
                  maxLength={4000}
                  placeholder="Escribe una respuesta si se notificara al usuario."
                />
              </label>

              {notice ? <div className="den-detail-notice">{notice}</div> : null}
            </div>

            <footer>
              <button type="button" className="den-secondary" onClick={() => setSelected(null)}>Cerrar</button>
              <button type="button" className="den-primary" onClick={saveDetail} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
