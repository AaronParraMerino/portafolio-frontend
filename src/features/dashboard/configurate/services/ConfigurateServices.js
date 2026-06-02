import BASE_URL from '../../../../services/http/const';

const getToken = (t) => {
	const token = localStorage.getItem('tokenPORT');

	if (!token) {
		throw new Error(t ? t('configurate.service.error.noSession') : 'No hay sesión activa. Inicia sesión nuevamente.');
	}

	return token;
};

const getHeaders = (t) => ({
	Accept: 'application/json',
	'Content-Type': 'application/json',
	Authorization: `Bearer ${getToken(t)}`,
});

const parseResponse = async (res, t) => {
	const payload = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(payload?.message || (t ? t('configurate.service.error.request') : 'Error al procesar la solicitud.'));
	}

	return payload;
};

export const fetchMySessions = async (t) => {
	const res = await fetch(`${BASE_URL}/seccion/mis-sesiones`, {
		method: 'GET',
		headers: getHeaders(t),
	});

	const data = await parseResponse(res, t);
	return Array.isArray(data?.data) ? data.data : [];
};

export const closeSessionById = async (sessionId, t) => {
	const res = await fetch(`${BASE_URL}/seccion/${sessionId}`, {
		method: 'DELETE',
		headers: getHeaders(t),
	});

	return parseResponse(res, t);
};

export const closeOtherSessions = async (t) => {
	const res = await fetch(`${BASE_URL}/seccion/otras`, {
		method: 'DELETE',
		headers: getHeaders(t),
	});

	return parseResponse(res, t);
};
