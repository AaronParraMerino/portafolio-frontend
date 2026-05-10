import BASE_URL from '../../../../services/http/const';

const getToken = () => {
	const token = localStorage.getItem('tokenPORT');

	if (!token) {
		throw new Error('No hay sesión activa. Inicia sesión nuevamente.');
	}

	return token;
};

const getHeaders = () => ({
	Accept: 'application/json',
	'Content-Type': 'application/json',
	Authorization: `Bearer ${getToken()}`,
});

const parseResponse = async (res) => {
	const payload = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(payload?.message || 'Error al procesar la solicitud.');
	}

	return payload;
};

export const fetchMySessions = async () => {
	const res = await fetch(`${BASE_URL}/seccion/mis-sesiones`, {
		method: 'GET',
		headers: getHeaders(),
	});

	const data = await parseResponse(res);
	return Array.isArray(data?.data) ? data.data : [];
};

export const closeSessionById = async (sessionId) => {
	const res = await fetch(`${BASE_URL}/seccion/${sessionId}`, {
		method: 'DELETE',
		headers: getHeaders(),
	});

	return parseResponse(res);
};

export const closeOtherSessions = async () => {
	const res = await fetch(`${BASE_URL}/seccion/otras`, {
		method: 'DELETE',
		headers: getHeaders(),
	});

	return parseResponse(res);
};
