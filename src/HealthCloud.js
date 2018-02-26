import ZeroKitAdapter from './services/ZeroKitAdapter';
import AuthService from './services/AuthService';
import documentService from './services/documentService';
import userService from './services/userService';
import createClientEncryptionService from './services/cryptoService';
import taggingUtils from './lib/taggingUtils';
import HCDocument from './lib/models/HCDocument';
import HCAttachment from './lib/models/HCAttachment';
import HCAuthor from './lib/models/HCAuthor';
import HCSpecialty from './lib/models/HCSpecialty';

class HealthCloud {
    constructor({ clientId, zeroKitAdapter }) {
        userService.setZeroKitAdapter(zeroKitAdapter);
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
        this.grantPermission = zeroKitAdapter.grantPermission.bind(zeroKitAdapter);
        this.getGrantedPermissions = userService.getGrantedPermissions.bind(userService);
        this.logout = zeroKitAdapter.logout.bind(zeroKitAdapter);

        this.models = {
            HCDocument,
            HCAttachment,
            HCAuthor,
            HCSpecialty,
        };
    }
}

class HealthCloudWeb extends HealthCloud {
    constructor(options) {
        const authService = new AuthService(options);
        const zeroKitAdapter = new ZeroKitAdapter({ authService });

        super({ ...options, zeroKitAdapter });

        this.getRegistrationForm = zeroKitAdapter.getRegistrationForm.bind(zeroKitAdapter);
        this.register = zeroKitAdapter.register.bind(zeroKitAdapter);

        this.getLoginForm = parentElement =>
            zeroKitAdapter.getLoginForm(parentElement)
                .then(userService.setupUser.bind(userService))
                .then((user) => {
                    const createUserSpecificEncryptionService =
                        createClientEncryptionService(options.clientId)(user.CUP.privateKey);
                    documentService.setEncryptionService(createUserSpecificEncryptionService);
                    return user;
                });

        // TODO remove! This is just for not having to login after reloading
        userService.getInternalUser()
            .then(userService.setupUser.bind(userService))
            .then((user) => {
                const createUserSpecificEncryptionService =
                        createClientEncryptionService(options.clientId)(user.CUP.privateKey);
                documentService.setEncryptionService(createUserSpecificEncryptionService);
            });
    }
}

class HealthCloudNode extends HealthCloud {
    constructor(options) {
        const authService = new AuthService(options);
        const zeroKitAdapter = new ZeroKitAdapter({ authService });
        super({ zeroKitAdapter });
        this.login = (hcUserAlias, password) =>
            zeroKitAdapter.loginNode(hcUserAlias, password)
                .then(userService.setupUser.bind(userService))
                .then((user) => {
                    const createUserSpecificEncryptionService =
                        createClientEncryptionService(options.clientId)(user.CUP.privateKey);
                    documentService.setEncryptionService(createUserSpecificEncryptionService);
                    return user;
                });
    }
}

module.exports = NODE ? HealthCloudNode : HealthCloudWeb;
