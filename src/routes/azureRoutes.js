import hcRequest from '../lib/hcRequest';

const azureRoutes = {

	downloadDocument(sasUrl) {
		return hcRequest('GET', sasUrl);
	},

	uploadDocument(sasUrl, blobString) {
		const body = { content: blobString };
		const headers = { 'x-ms-blob-type': 'BlockBlob' };
		return hcRequest('PUT', sasUrl, body, { headers });
	},

};

export default azureRoutes;
