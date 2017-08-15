import config from '../config';
import hcRequest from '../lib/hcRequest';

const documentUrl = config.api.document;

const documentRoutes = {

	getUserDocumentSAS(hcUsername, documentId) {
		return hcRequest('GET', `${documentUrl}/users/${hcUsername}/documents/${documentId}/access_token`);
	},

	getUploadUserDocumentSAS(hcUsername, body) {
		return hcRequest('POST', `${documentUrl}/users/${hcUsername}/documents`, body);
	},

	changeUserDocument(hcUsername, documentId, body) {
		return hcRequest('PUT', `${documentUrl}/users/${hcUsername}/documents/${documentId}/status`, body);
	},

};

export default documentRoutes;
