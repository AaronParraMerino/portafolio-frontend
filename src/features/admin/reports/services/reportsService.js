import BASE_URL from '../../../../services/http/const';

function getAdminRequestHeaders() {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!token) {
    throw new Error('No hay sesion administrativa activa.');
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAdminReport(filters = {}) {
  const query = new URLSearchParams();

  if (filters.desde) query.set('desde', filters.desde);
  if (filters.hasta) query.set('hasta', filters.hasta);

  const response = await fetch(`${BASE_URL}/administrador/reportes/resumen?${query}`, {
    headers: getAdminRequestHeaders(),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'No se pudo generar el reporte administrativo.');
  }

  return payload;
}
