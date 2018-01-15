import hcRequest from '../lib/hcRequest';

const fileRoutes = {

    downloadFile(sasUrl) {
        return hcRequest('GET', sasUrl, { responseType: 'blob' });
    },

    uploadFile(sasUrl, blob) {
        const headers = {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': 'application/octet-stream',
        };
        return hcRequest('PUT', sasUrl, { body: blob, headers });
    },

};

export default fileRoutes;
