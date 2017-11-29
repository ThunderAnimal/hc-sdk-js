import request from 'superagent-bluebird-promise';
import sessionHandler from './sessionHandler';
import authRoutes from '../routes/authRoutes';

const buildCustomError = error => ({
	status: error.status,
	error: error.body || error,
});

const sendRefreshToken = () => {
	const params = {
		refresh_token: sessionHandler.get('HC_Refresh'),
		grant_type: 'refresh_token',
	};

	return authRoutes.getRefreshTokenFromCode(params)
		.then((res) => {
			sessionHandler.set('HC_Auth', res.access_token);
			sessionHandler.set('HC_Refresh', res.refresh_token);
			return res;
		});
};

const isAuthorisedPath = path => ['documents', 'records', 'permissions']
	.some(el => path.includes(el));

const isExpired = error =>
	error.status === 401 && error.res && error.res.header['www-authenticate'].includes('expired');

const hcRequest = (type, path, body, { query = {}, headers = {}, responseType = '' } = {}) => {
	let retries = 0;


	const promise = () => {
		if (isAuthorisedPath(path))	{
			headers.Authorization = `Bearer ${sessionHandler.get('HC_Auth')}`;
		}
		return request(type, path)
			.set(headers)
			.query(query)
			.responseType(responseType)
			.send(body)
			.then(res => res.body || res.text)
			.catch((err) => {
				if (isExpired(err) && retries < 2) {
					retries += 1;
					return sendRefreshToken()
						.then(() => promise());
				}
				throw buildCustomError(err);
			});
	};

	return promise();
};


export default hcRequest;
