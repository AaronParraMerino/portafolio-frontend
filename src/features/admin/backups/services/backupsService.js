import BASE_URL from '../../../../services/http/const';

function getHeaders(json = false) {
  const token = localStorage.getItem('tokenPORT') || sessionStorage.getItem('tokenPORT');

  if (!token) throw new Error('adminBackups.error.session');

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function parseError(response, fallbackKey) {
  const payload = await response.json().catch(() => ({}));
  const validationMessage = Object.values(payload?.errors || {}).flat().find(Boolean);
  const message = validationMessage || payload?.message || fallbackKey;
  const error = new Error(message);
  error.translationKey = message === fallbackKey ? fallbackKey : null;
  throw error;
}

export async function fetchBackupMetadata() {
  const response = await fetch(`${BASE_URL}/administrador/respaldos`, {
    headers: getHeaders(),
  });

  if (!response.ok) return parseError(response, 'adminBackups.error.metadata');
  return response.json();
}

export async function generateBackup(payload) {
  const response = await fetch(`${BASE_URL}/administrador/respaldos/generar`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) return parseError(response, 'adminBackups.error.generate');
  return response.blob();
}
