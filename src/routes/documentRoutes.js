import config from 'config';
import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const documentRoutes = {

    getFileDownloadUrl(userId, recordId, fileId) {
        return hcRequest.submit('GET', `${apiUrl}/users/${userId}/documents/${recordId}/files/${fileId}/download_access_token`, { authorize: true });
    },

    getFileUploadUrls(userId, recordId, fileNumber) {
        const body = { file_number: fileNumber };
        return hcRequest.submit('POST', `${apiUrl}/users/${userId}/documents/${recordId}/tokens`, { body, authorize: true });
    },

    createRecord(userId, data) {
        return hcRequest.submit('POST', `${apiUrl}/users/${userId}/records`, { body: data, authorize: true });
    },

    updateRecord(userId, recordId, data) {
        return hcRequest.submit('PUT', `${apiUrl}/users/${userId}/records/${recordId}`, { body: data, authorize: true });
    },

    searchRecords(userId, queryParams) {
        return hcRequest.submit('GET', `${apiUrl}/users/${userId}/records`, { query: queryParams, authorize: true, includeResponseHeaders: true })
            .then(({ body, headers }) => ({ records: body, totalCount: headers['x-total-count'] }));
    },

    getRecordsCount(userId, queryParams) {
        return hcRequest.submit('HEAD', `${apiUrl}/users/${userId}/records`, { query: queryParams, authorize: true, includeResponseHeaders: true })
            .then(({ headers }) => ({ totalCount: headers['x-total-count'] }));
    },

    downloadRecord(userId, recordId) {
        return hcRequest.submit('GET', `${apiUrl}/users/${userId}/records/${recordId}`, { authorize: true });
    },

    updateRecordStatus(userId, recordId, status) {
        return hcRequest.submit('PUT', `${apiUrl}/users/${userId}/records/${recordId}/status/${status}`, { authorize: true });
    },

    deleteRecord(userId, recordId) {
        return hcRequest.submit('DELETE', `${apiUrl}/users/${userId}/records/${recordId}`, { authorize: true });
    },

    fetchAttachmentKey(userId, recordId) {
        return hcRequest('GET', `${apiUrl}/users/${userId}/records/${recordId}/attachment_key`, { authorize: true });
    },
};

export default documentRoutes;
