import ZeroKitAdapter from './services/ZeroKitAdapter';
import AuthService from './services/AuthService';
import DocumentService from './services/DocumentService';
import UserService from './services/UserService';
import HCDocument from './lib/models/HCDocument';
import HCAttachment from './lib/models/HCAttachment';

class HealthCloud {
    constructor({ documentService, zeroKitAdapter }) {
        UserService.setZeroKitAdapter(zeroKitAdapter);

        this.downloadDocument = documentService.downloadDocument.bind(documentService);
        this.deleteDocument = documentService.deleteDocument.bind(documentService);
        this.getDocuments = documentService.getDocuments.bind(documentService);
        this.uploadDocument = documentService.uploadDocument.bind(documentService);
        this.updateDocument = documentService.updateDocument.bind(documentService);
        this.getCurrentUser = UserService.getCurrentUser.bind(UserService);
        this.getUserIdByAlias = UserService.getUserIdForAlias.bind(UserService);
        this.getUser = UserService.getUser.bind(UserService);
        this.updateUser = UserService.updateUser.bind(UserService);
        this.grantPermission = zeroKitAdapter.grantPermission.bind(zeroKitAdapter);
        this.getGrantedPermissions = UserService.getGrantedPermissions.bind(UserService);
        this.logout = zeroKitAdapter.logout.bind(zeroKitAdapter);

        this.models = {
            HCDocument,
            HCAttachment,
        };
    }
}

class HealthCloudWeb extends HealthCloud {
    constructor(options) {
        const authService = new AuthService(options);
        const zeroKitAdapter = new ZeroKitAdapter({ authService });
        const documentService = new DocumentService({ zeroKitAdapter });
        super({ documentService, zeroKitAdapter });
        this.getLoginForm = zeroKitAdapter.getLoginForm.bind(zeroKitAdapter);
        this.getRegistrationForm = zeroKitAdapter.getRegistrationForm.bind(zeroKitAdapter);
        this.register = zeroKitAdapter.register.bind(zeroKitAdapter);
    }
}

class HealthCloudNode extends HealthCloud {
    constructor(options) {
        const authService = new AuthService(options);
        const zeroKitAdapter = new ZeroKitAdapter({ authService });
        const documentService = new DocumentService({ zeroKitAdapter });
        super({ documentService, zeroKitAdapter });
        this.login = zeroKitAdapter.loginNode.bind(zeroKitAdapter);
    }
}

module.exports = NODE ? HealthCloudNode : HealthCloudWeb;
