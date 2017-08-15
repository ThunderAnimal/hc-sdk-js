import ZeroKitAdapter from './services/ZeroKitAdapter';
import AuthService from './services/AuthService';
import DocumentService from './services/DocumentService';
import UserService from './services/UserService';


class HealthCloud {
	constructor(options) {
		const authService = new AuthService(options);
		const zeroKitAdapter = new ZeroKitAdapter({ authService });
		const documentService = new DocumentService({ zeroKitAdapter });
		this.getLoginForm = zeroKitAdapter.getLoginForm.bind(zeroKitAdapter);
		this.getRegistrationForm = zeroKitAdapter.getRegistrationForm.bind(zeroKitAdapter);
		this.downloadDocument = documentService.downloadDocument.bind(documentService);
		this.uploadDocument = documentService.uploadDocument.bind(documentService);
		this.getUser = UserService.getUser;
	}
}

module.exports = HealthCloud;

