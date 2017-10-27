import config from 'config';
import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const documentRoutes = {

	getFileDownloadUrl(userId, recordId, fileId) {
		return hcRequest('GET', `${apiUrl}/users/${userId}/documents/${recordId}/files/${fileId}/download_access_token`);
	},

	getFileUploadUrls(userId, recordId, fileNumber) {
		return hcRequest('POST', `${apiUrl}/users/${userId}/documents/${recordId}/tokens`, { file_number: fileNumber });
	},

	createRecord(userId, data) {
		return hcRequest('POST', `${apiUrl}/users/${userId}/records`, data);
	},

	updateRecord(userId, recordId, data) {
		return hcRequest('PUT', `${apiUrl}/users/${userId}/records/${recordId}`, data);
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

	deleteRecord(userId, recordId) {
		return hcRequest('DELETE', `${apiUrl}/users/${userId}/records/${recordId}`);
	},
};

export default documentRoutes;
