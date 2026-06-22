import BASE_URL from '../../../../services/http/const';

export const DENUNCIA_STATUS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'en_revision', label: 'En revision' },
  { id: 'resuelta', label: 'Resueltas' },
  { id: 'descartada', label: 'Descartadas' },
];

export const DENUNCIA_STATUS_META = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  en_revision: { label: 'En revision', tone: 'primary' },
  resuelta: { label: 'Resuelta', tone: 'success' },
  descartada: { label: 'Descartada', tone: 'muted' },
};

function getAdminRequestHeaders() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseAdminResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.status === 'error') {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export async function fetchAdminDenuncias(filters = {}, fallbackMessage = 'No se pudieron cargar las denuncias.') {
  const query = new URLSearchParams();

  if (filters.estado && filters.estado !== 'todos') query.set('estado', filters.estado);
  if (filters.q) query.set('q', filters.q);
  if (filters.page) query.set('page', String(filters.page));
  query.set('per_page', String(filters.per_page || 12));

  const response = await fetch(`${BASE_URL}/administrador/denuncias?${query}`, {
    headers: getAdminRequestHeaders(),
  });

  return parseAdminResponse(response, fallbackMessage);
}

export async function updateAdminDenuncia(
  denunciaId,
  payload,
  fallbackMessage = 'No se pudo actualizar la denuncia.',
) {
  const response = await fetch(`${BASE_URL}/administrador/denuncias/${denunciaId}`, {
    method: 'PATCH',
    headers: {
      ...getAdminRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseAdminResponse(response, fallbackMessage);
}
