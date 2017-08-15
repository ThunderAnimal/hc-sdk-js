import hcRequest from '../lib/hcRequest';

const azureRoutes = {

	downloadDocument(sasUrl) {
		return hcRequest('GET', sasUrl);
	},

	uploadDocument(sasUrl, blobString) {
		const body = { content: blobString };

		return hcRequest('PUT', sasUrl, body, { 'x-ms-blob-type': 'BlockBlob' });
	},

};

export default azureRoutes;
