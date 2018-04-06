import documentService from './services/documentService';
import userService from './services/userService';
import createClientEncryptionService from './services/cryptoService';
import taggingUtils from './lib/taggingUtils';
import hcRequest from './lib/hcRequest';
import HCDocument from './lib/models/HCDocument';
import HCAttachment from './lib/models/HCAttachment';
import HCAuthor from './lib/models/HCAuthor';
import HCSpecialty from './lib/models/HCSpecialty';

class HealthCloud {
    constructor(clientId, userId, privateKey, accessToken, requestAccessToken) {
        taggingUtils.clientId = clientId;

        this.downloadDocument = documentService.downloadDocument.bind(documentService);
        this.deleteDocument = documentService.deleteDocument.bind(documentService);
        this.getDocuments = documentService.getDocuments.bind(documentService);
        this.getDocumentsCount = documentService.getDocumentsCount.bind(documentService);
        this.uploadDocument = documentService.uploadDocument.bind(documentService);
        this.updateDocument = documentService.updateDocument.bind(documentService);
        this.getCurrentUser = userService.getCurrentUser.bind(userService);
        this.getUserIdByAlias = userService.getUserIdForAlias.bind(userService);
        this.getUser = userService.getUser.bind(userService);
        this.updateUser = userService.updateUser.bind(userService);
        this.logout = userService.resetUser.bind(userService);
        this.updateAccessToken = hcRequest.setAccessToken.bind(hcRequest);

        // setup
        documentService.setEncryptionService(
            createClientEncryptionService(clientId)(privateKey));
        hcRequest.setAccessToken(accessToken);
        hcRequest.requestAccessToken = requestAccessToken;
        userService.currentUser = userId;

        this.models = {
            HCDocument,
            HCAttachment,
            HCAuthor,
            HCSpecialty,
        };
    }
}

module.exports = HealthCloud;
