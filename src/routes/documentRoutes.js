import config from 'config';
import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const documentRoutes = {

    getFileDownloadUrl(ownerId, recordId, fileId) {
        return hcRequest.submit('GET', `${apiUrl}/users/${ownerId}/documents/${recordId}/files/${fileId}/download_access_token`, { authorize: true, ownerId });
    },

    getFileUploadUrls(ownerId, recordId, fileNumber) {
        const body = { file_number: fileNumber };
        return hcRequest.submit('POST', `${apiUrl}/users/${ownerId}/documents/${recordId}/tokens`, { body, authorize: true, ownerId });
    },

    createRecord(ownerId, data) {
        return hcRequest.submit('POST', `${apiUrl}/users/${ownerId}/records`, { body: data, authorize: true, ownerId });
    },

    updateRecord(ownerId, recordId, data) {
        return hcRequest.submit('PUT', `${apiUrl}/users/${ownerId}/records/${recordId}`, { body: data, authorize: true, ownerId });
    },

    searchRecords(ownerId, queryParams) {
        return hcRequest.submit('GET', `${apiUrl}/users/${ownerId}/records`, {
            query: queryParams,
            authorize: true,
            includeResponseHeaders: true,
            ownerId,
        })
            .then(({ body, headers }) => ({ records: body, totalCount: headers['x-total-count'] }));
    },

    getRecordsCount(ownerId, queryParams) {
        return hcRequest.submit('HEAD', `${apiUrl}/users/${ownerId}/records`, {
            query: queryParams,
            authorize: true,
            includeResponseHeaders: true,
            ownerId,
        })
            .then(({ headers }) => ({ totalCount: headers['x-total-count'] }));
    },

    downloadRecord(ownerId, recordId) {
        return hcRequest.submit('GET', `${apiUrl}/users/${ownerId}/records/${recordId}`, { authorize: true, ownerId });
    },

    updateRecordStatus(ownerId, recordId, status) {
        return hcRequest.submit('PUT', `${apiUrl}/users/${ownerId}/records/${recordId}/status/${status}`, { authorize: true, ownerId });
    },

    deleteRecord(ownerId, recordId) {
        return hcRequest.submit('DELETE', `${apiUrl}/users/${ownerId}/records/${recordId}`, { authorize: true, ownerId });
    },

    fetchAttachmentKey(ownerId, recordId) {
        return hcRequest.submit('GET', `${apiUrl}/users/${ownerId}/records/${recordId}/attachment_key`, { authorize: true, ownerId });
    },
};

export default documentRoutes;
