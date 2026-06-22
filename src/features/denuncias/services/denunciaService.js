import BASE_URL from '../../../services/http/const';
import { scheduleRequest } from '../../../shared/services/requestScheduler';

function getToken() {
  return localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');
}

async function resolveResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.status !== 'success') {
    throw new Error(payload?.message || 'No se pudo enviar el reporte.');
  }

  return payload;
}

export function enviarDenunciaAdministracion({ asunto, detalle, evidencia = [], metadata = {}, imagen = null }) {
  const token = getToken();

  if (!token) {
    throw new Error('Debes iniciar sesion para contactar administracion.');
  }

  return scheduleRequest(async () => {
    const body = new FormData();
    body.append('asunto', asunto);
    body.append('detalle', detalle);

    Object.entries(metadata || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        body.append(`metadata[${key}]`, String(value));
      }
    });

    evidencia.forEach((item, index) => {
      body.append(`evidencia[${index}]`, item);
    });

    if (imagen) {
      body.append('evidencia_imagen', imagen);
    }

    const response = await fetch(`${BASE_URL}/denuncias`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    return resolveResponse(response);
  }, { priority: 'high' });
}
