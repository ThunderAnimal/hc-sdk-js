import hcRequest from '../lib/hcRequest';

const azureRoutes = {

	downloadFile(sasUrl) {
		return hcRequest('GET', sasUrl);
	},

	uploadFile(sasUrl, blobString) {
		const body = { content: blobString };
		const headers = { 'x-ms-blob-type': 'BlockBlob' };
		return hcRequest('PUT', sasUrl, body, { headers });
	},

};

export default azureRoutes;
