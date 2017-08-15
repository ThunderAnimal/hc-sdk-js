import request from 'superagent';
import sessionHandler from './sessionHandler';
import authRoutes from '../routes/authRoutes';

const buildCustomError = function (error, response = {}) {
	return {
		status: error.status,
		error: response.body || error,
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

const isExpired = error => error.status === '401' && error.error.message.includes('expired');

const hcRequest = function (type, path, body, options) {
	let retriesAllowed = 2;

	const promiseFunction = (resolve, reject) => {
		function success(data) {
			if (resolve) {
				resolve(data);
			}
		}

		function failure(error) {
			if (isExpired(error) && retriesAllowed > 0) {
				retriesAllowed -= 1;

				sendRefreshToken()
					.then(() => new Promise(promiseFunction(resolve, reject)));
			}	else if (reject) {
				reject(error);
			}
		}

		function responseHandler(error, response) {
			if (error) {
				failure(buildCustomError(error, response));
			} else {
				success(response.body || response.text);
			}
		}
		const req = request(type, path);

		if (isAuthorisedPath(path))	{
			req.set('Authorization', `Bearer ${sessionHandler.get('HC_Auth')}`);
		}

		if (options) {
			req.set(options);
		}

		req.send(body).end(responseHandler);
	};

	return new Promise(promiseFunction);
};


export default hcRequest;
