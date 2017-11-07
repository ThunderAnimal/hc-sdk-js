import ZeroKitAdapter from './services/ZeroKitAdapter';
import AuthService from './services/AuthService';
import DocumentService from './services/DocumentService';
import UserService from './services/UserService';
import FhirService from './services/FhirService';


class HealthCloud {
	constructor(options) {
		const authService = new AuthService(options);
		const zeroKitAdapter = new ZeroKitAdapter({ authService });
		const documentService = new DocumentService({ zeroKitAdapter });
		const fhirService = new FhirService({ zeroKitAdapter });
		this.getLoginForm = zeroKitAdapter.getLoginForm.bind(zeroKitAdapter);
		this.getRegistrationForm = zeroKitAdapter.getRegistrationForm.bind(zeroKitAdapter);
		this.downloadDocument = documentService.downloadDocument.bind(documentService);
		this.uploadDocument = documentService.uploadDocument.bind(documentService);
		this.updateDocumentMetadata = documentService.updateDocumentMetadata.bind(documentService);
		this.addFilesToDocument = documentService.addFilesToDocument.bind(documentService);
		this.deleteFilesFromDocument =
			documentService.deleteFilesFromDocument.bind(documentService);
		this.getUserIdAndAlias = UserService.getUserIdAndAlias;
		this.getUser = UserService.getUser.bind(UserService);
		this.updateUser = UserService.updateUser.bind(UserService);
		this.searchRecords = fhirService.searchRecords.bind(fhirService);
		this.uploadFhirRecord = fhirService.createFhirRecord.bind(fhirService);
		this.downloadFhirRecord = fhirService.downloadFhirRecord.bind(fhirService);
		this.updateFhirRecord = fhirService.updateFhirRecord.bind(fhirService);
		this.deleteRecord = fhirService.deleteRecord.bind(fhirService);
		this.logout = zeroKitAdapter.logout.bind(zeroKitAdapter);
	}
}

module.exports = HealthCloud;

