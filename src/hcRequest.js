import request from 'superagent';
import Promise from 'es6-promise';

let buildCustomError = function (error, response) {
	return {
		status: error.status,
		error: (response ? response.body : null) || error,
		response,
	};
};

const hcRequest = function (type, path, body) {
	let promiseFunction = (resolve, reject) => {
		function success(data) {
			if (resolve) {
				resolve(data);
			}
		}

		function failure(error) {
			if (reject) {
				reject(error);
			}
		}

		function responseHandler(error, response) {
			if (error) {
				failure(buildCustomError(error, response));
			} else {
				success(response.body);
			}
		}

		request(type, path).send(body)
			.responseType('json')
			.end(responseHandler);
	};

	return new Promise(promiseFunction);
};

export default hcRequest;
