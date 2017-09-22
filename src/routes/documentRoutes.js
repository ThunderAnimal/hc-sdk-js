import config from '../config';
import hcRequest from '../lib/hcRequest';

const documentUrl = config.api.document;
const dataUrl = config.api.data;

const documentRoutes = {

	getDownloadUserDocumentToken(userId, recordId) {
		return hcRequest('GET', `${documentUrl}/users/${userId}/documents/${recordId}/download_access_token`);
	},

	getUploadUserDocumentToken(userId, recordId) {
		return hcRequest('GET', `${documentUrl}/users/${userId}/documents/${recordId}/upload_access_token`);
	},

	uploadRecord(userId, data) {
		return hcRequest('POST', `${dataUrl}/users/${userId}/records`, data);
	},

	searchRecords(queryParams) {
		return hcRequest('GET', `${dataUrl}/records`, {}, { query: queryParams });
	},

	downloadRecord(userId, recordId) {
		return hcRequest('GET', `${dataUrl}/users/${userId}/records/${recordId}`);
	},

	updateRecordStatus(userId, recordId, status) {
		return hcRequest('PUT', `${dataUrl}/users/${userId}/records/${recordId}/status/${status}`);
	},
};

export default documentRoutes;
