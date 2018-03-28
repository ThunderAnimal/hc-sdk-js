import hcRequest from '../lib/hcRequest';

const fileRoutes = {

    downloadFile(sasUrl) {
        return hcRequest.submit('GET', sasUrl, { responseType: 'blob' });
    },

    uploadFile(sasUrl, blob) {
        const headers = {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': 'application/octet-stream',
        };
        return hcRequest.submit('PUT', sasUrl, { body: blob, headers });
    },

};

export default fileRoutes;
