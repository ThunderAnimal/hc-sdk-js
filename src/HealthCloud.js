import ZeroKitAdapter from './services/ZeroKitAdapter';
import AuthService from './services/AuthService';
import DocumentService from './services/DocumentService';
import userService from './services/userService';
import HCDocument from './lib/models/HCDocument';
import HCAttachment from './lib/models/HCAttachment';

class HealthCloud {
    constructor({ documentService, zeroKitAdapter }) {
        userService.setZeroKitAdapter(zeroKitAdapter);

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
