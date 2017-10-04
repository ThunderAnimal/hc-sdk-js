import config from '../config';
import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const documentRoutes = {

	getDownloadUserDocumentToken(userId, recordId) {
		return hcRequest('GET', `${apiUrl}/users/${userId}/documents/${recordId}/download_access_token`);
	},

	getUploadUserDocumentToken(userId, recordId) {
		return hcRequest('GET', `${apiUrl}/users/${userId}/documents/${recordId}/upload_access_token`);
	},

	uploadRecord(userId, data) {
		return hcRequest('POST', `${apiUrl}/users/${userId}/records`, data);
	},

	searchRecords(queryParams) {
		return hcRequest('GET', `${apiUrl}/records`, {}, { query: queryParams });
	},

	downloadRecord(userId, recordId) {
		return hcRequest('GET', `${apiUrl}/users/${userId}/records/${recordId}`);
	},

	updateRecordStatus(userId, recordId, status) {
		return hcRequest('PUT', `${apiUrl}/users/${userId}/records/${recordId}/status/${status}`);
	},
};

export default documentRoutes;
