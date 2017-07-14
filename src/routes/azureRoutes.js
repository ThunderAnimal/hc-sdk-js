import hcRequest from '../hcRequest';

const azureRoutes = {};

azureRoutes.getDocument = function (sasUrl) {
	return hcRequest('GET', sasUrl);
};

azureRoutes.uploadDocument = function (sasUrl, blobString) {
	let body = {
		content: blobString,
	};

	return hcRequest('PUT', sasUrl, body, 'blob');
};

module.exports = azureRoutes;
