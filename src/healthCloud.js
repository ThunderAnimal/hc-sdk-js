import documentService from './services/documentService';
import hcCrypto from './lib/crypto';
import hcRequest from './lib/hcRequest';
import taggingUtils from './lib/taggingUtils';
import userService from './services/userService';
import HCDocument from './lib/models/HCDocument';
import HCAttachment from './lib/models/HCAttachment';
import HCAuthor from './lib/models/HCAuthor';
import HCSpecialty from './lib/models/HCSpecialty';
import authCloud from './authCloud';

const healthCloud = {
    getCurrentUserId: userService.getCurrentUserId.bind(userService),
    getCurrentAppId: userService.getCurrentAppId.bind(userService),
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


    /**
     * sets up the GC-SDK
     * @param {String} clientId - the clientId provided by GesundheitsCloud
     * @param {String} base64PrivateKey - the privateKey returned from the createCAP method
     *      (base64 encoded privateKey)
     * @param {Function} requestAccessToken - () => Promise<String>: returns a new valid accessToken
     *      of the logged in user
     * @returns {Promise<String>} the id of the logged in user
     */
    setup(clientId, base64PrivateKey, requestAccessToken) {
        taggingUtils.clientId = clientId;
        hcRequest.requestAccessToken = requestAccessToken;
        userService.setPrivateKey(base64PrivateKey);
        return requestAccessToken()
            .then((accessToken) => {
                hcRequest.setMasterAccessToken(accessToken);
                return userService.pullUser();
            })
            .then(({ id }) => {
                hcRequest.currentUserId = id;
                return id;
            });
    },

    /**
     * resets the SDK
     */
    reset() {
        taggingUtils.clientId = null;
        hcRequest.reset();
        userService.resetUser();
    },
};

module.exports = {
    SDK: healthCloud,
    AUTH: authCloud,
};
