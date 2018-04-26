import createClientEncryptionService from './services/cryptoService';
import documentService from './services/documentService';
import hcCrypto from './lib/crypto';
import hcRequest from './lib/hcRequest';
import taggingUtils from './lib/taggingUtils';
import userService from './services/userService';
import HCDocument from './lib/models/HCDocument';
import HCAttachment from './lib/models/HCAttachment';
import HCAuthor from './lib/models/HCAuthor';
import HCSpecialty from './lib/models/HCSpecialty';

const healthCloud = {
    downloadDocument: documentService.downloadDocument.bind(documentService),
    deleteDocument: documentService.deleteDocument.bind(documentService),
    getDocuments: documentService.getDocuments.bind(documentService),
    getDocumentsCount: documentService.getDocumentsCount.bind(documentService),
    uploadDocument: documentService.uploadDocument.bind(documentService),
    updateDocument: documentService.updateDocument.bind(documentService),
    getCurrentUser: userService.getCurrentUser.bind(userService),
    getUserIdByAlias: userService.getUserIdForAlias.bind(userService),
    getUser: userService.getUser.bind(userService),
    updateUser: userService.updateUser.bind(userService),
    logout: userService.resetUser.bind(userService),
    updateAccessToken: hcRequest.setAccessToken.bind(hcRequest),
    createCAP: () =>
        hcCrypto.generateAsymKeyPair(hcCrypto.keyTypes.APP).then(({ publicKey, privateKey }) => ({
            publicKey: btoa(JSON.stringify(publicKey)),
            privateKey: btoa(JSON.stringify(privateKey)),
        })),

    models: {
        HCDocument,
        HCAttachment,
        HCAuthor,
        HCSpecialty,
    },

    setup(clientId, base64PrivateKey, requestAccessToken) {
        const privateKey = JSON.parse(atob(base64PrivateKey));
        taggingUtils.clientId = clientId;
        documentService.setEncryptionService(
            createClientEncryptionService(clientId)(privateKey));
        requestAccessToken().then(hcRequest.setAccessToken);
        hcRequest.requestAccessToken = requestAccessToken;
        userService.setPrivateKey(base64PrivateKey);
    },
};

module.exports = { SDK: healthCloud };
