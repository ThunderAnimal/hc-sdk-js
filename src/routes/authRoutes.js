import config from 'config';
import sessionHandler from 'session-handler';

import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const authRoutes = {

	getAccessTokenFromCode(body) {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${sessionHandler.get('HC_Id')}`,
		};

		return hcRequest('POST', `${apiUrl}/auth/token`, { body, headers });
	},

	getAccessTokenFromCredentials(body) {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
		};

		return hcRequest('POST', `${apiUrl}/auth/token`, { body, headers });
	},

	getRefreshTokenFromCode(body) {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${sessionHandler.get('HC_Id')}`,
		};

		return hcRequest('POST', `${apiUrl}/auth/token`, { body, headers });
	},

	revokeRefreshToken(token) {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${sessionHandler.get('HC_Id')}`,
		};

		const body = { token };

		return hcRequest('POST', `${apiUrl}/auth/token/revoke`, { headers, body });
	},
};

export default authRoutes;
