import config from 'config';
import hcRequest from '../lib/hcRequest';
import SessionHandler from '../lib/sessionHandler';

const apiUrl = config.api;

const authRoutes = {

	getAccessTokenFromCode(body) {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${SessionHandler.get('HC_Id')}`,
		};

		return hcRequest('POST', `${apiUrl}/auth/token`, { body, headers });
	},

	getRefreshTokenFromCode(body) {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${SessionHandler.get('HC_Id')}`,
		};

		return hcRequest('POST', `${apiUrl}/auth/token`, { body, headers });
	},
};

export default authRoutes;
