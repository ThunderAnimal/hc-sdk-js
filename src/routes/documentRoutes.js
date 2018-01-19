import config from 'config';
import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const documentRoutes = {

    getFileDownloadUrl(userId, recordId, fileId) {
        return hcRequest('GET', `${apiUrl}/users/${userId}/documents/${recordId}/files/${fileId}/download_access_token`, { authorize: true });
    },

    getFileUploadUrls(userId, recordId, fileNumber) {
        const body = { file_number: fileNumber };
        return hcRequest('POST', `${apiUrl}/users/${userId}/documents/${recordId}/tokens`, { body, authorize: true });
    },

    createRecord(userId, data) {
        return hcRequest('POST', `${apiUrl}/users/${userId}/records`, { body: data, authorize: true });
    },

    updateRecord(userId, recordId, data) {
        return hcRequest('PUT', `${apiUrl}/users/${userId}/records/${recordId}`, { body: data, authorize: true });
    },

    searchRecords(userId, queryParams) {
        return hcRequest('GET', `${apiUrl}/users/${userId}/records`, { query: queryParams, authorize: true, includeResponseHeaders: true })
            .then(({ body, headers }) => ({ records: body, totalCount: headers['x-total-count'] }));
    },

    getRecordsCount(userId, queryParams) {
        return hcRequest('HEAD', `${apiUrl}/users/${userId}/records`, { query: queryParams, authorize: true, includeResponseHeaders: true })
            .then(({ body, headers }) => ({ totalCount: headers['x-total-count'] }));
    },

    downloadRecord(userId, recordId) {
        return hcRequest('GET', `${apiUrl}/users/${userId}/records/${recordId}`, { authorize: true });
    },

    updateRecordStatus(userId, recordId, status) {
        return hcRequest('PUT', `${apiUrl}/users/${userId}/records/${recordId}/status/${status}`, { authorize: true });
    },

    deleteRecord(userId, recordId) {
        return hcRequest('DELETE', `${apiUrl}/users/${userId}/records/${recordId}`, { authorize: true });
    },
};

export default documentRoutes;
