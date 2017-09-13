import config from '../config';
import hcRequest from '../lib/hcRequest';

const documentUrl = config.api.document;
const dataUrl = config.api.data;

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

	uploadRecord(data) {
		return hcRequest('POST', `${dataUrl}/records`, data);
	},

	searchRecords(queryParams) {
		return hcRequest('GET', `${dataUrl}/records`, {}, { query: queryParams });
	},

	downloadRecord(recordId) {
		return hcRequest('GET', `${dataUrl}/records/${recordId}`);
	},
};

export default documentRoutes;
