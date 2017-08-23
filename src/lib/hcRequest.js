import request from 'superagent-bluebird-promise';
import sessionHandler from './sessionHandler';
import authRoutes from '../routes/authRoutes';

const buildCustomError = function (error) {
	return {
		status: error.status,
		error: error.body || error,
	};
};

const sendRefreshToken = function () {
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

const isAuthorisedPath = path => path.includes('document');

const isExpired = error => error.status === '401' && error.message.includes('expired');

const hcRequest = function (type, path, body, options = { query: {}, headers: {} }) {
	let retries = 0;

	if (isAuthorisedPath(path))	{
		options.headers.Authorization = `Bearer ${sessionHandler.get('HC_Auth')}`;
	}

	const promise = () => request(type, path)
		.set(options.headers)
		.query(options.query)
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
	return promise();
};


export default hcRequest;
