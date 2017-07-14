import request from 'superagent';
import Promise from 'es6-promise';
import sessionHandler from './services/SessionHandler';

let buildCustomError = function (error, response) {
	return {
		status: error.status,
		error: (response ? response.body : null) || error,
		response,
	};
};

const hcRequest = function (type, path, body, requestType) {
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
                // response.text used for downloaded documents from
				// sasurl where data is not returned as json
				success(response.body || response.text);
			}
		}

		let req = request(type, path);

		if (requestType === 'form') {
			req.set('Content-Type', 'application/x-www-form-urlencoded');
		}		else if (requestType === 'blob') {
			req.set('x-ms-blob-type', 'BlockBlob');
		}

		req.send(body)
			// .responseType('json')
			.end(responseHandler);
	};

	return new Promise(promiseFunction);
};


module.exports = hcRequest;
