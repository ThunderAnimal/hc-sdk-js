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
    getCurrentUserId: userService.getCurrentUserId.bind(userService),
    grantPermission: userService.grantPermission.bind(userService),
    getReceivedPermissions: userService.getReceivedPermissions.bind(userService),
    downloadDocument: documentService.downloadDocument.bind(documentService),
    deleteDocument: documentService.deleteDocument.bind(documentService),
    getDocuments: documentService.getDocuments.bind(documentService),
    getDocumentsCount: documentService.getDocumentsCount.bind(documentService),
    uploadDocument: documentService.uploadDocument.bind(documentService),
    updateDocument: documentService.updateDocument.bind(documentService),
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
        taggingUtils.clientId = clientId;
        hcRequest.requestAccessToken = requestAccessToken;
        userService.setPrivateKey(base64PrivateKey);
        return requestAccessToken()
            .then((accessToken) => {
                hcRequest.setMasterAccessToken(accessToken);
                return userService.getUser();
            })
            .then(({ id }) => {
                hcRequest.currentUserId = id;
                return id;
            });
    },

    reset() {
        taggingUtils.clientId = null;
        hcRequest.reset();
        userService.resetUser();
    },
};

module.exports = { SDK: healthCloud };
