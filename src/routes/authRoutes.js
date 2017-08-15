import config from '../config';
import hcRequest from '../lib/hcRequest';
import SessionHandler from '../lib/sessionHandler';

const authUrl = config.api.auth;

const authRoutes = {

	getAccessTokenFromCode(body) {
		const options = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${SessionHandler.get('HC_Id')}`,
		};

		return hcRequest('POST', `${authUrl}/auth/token`, body, options);
	},

	getRefreshTokenFromCode(body) {
		const options = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${SessionHandler.get('HC_Id')}`,
		};

		return hcRequest('POST', `${authUrl}/auth/token`, body, options);
	},

};

export default authRoutes;
