import documentRoutes from '../routes/documentRoutes';
import azureRoutes from '../routes/azureRoutes';

class DocumentService {
	constructor(options = {}) {
		this.zeroKitAdapter = options.zeroKitAdapter;
	}

	downloadDocument(hcUsername, documentId) {
		return documentRoutes.getUserDocumentSAS(hcUsername, documentId)
			.then(res => azureRoutes.downloadDocument(res.sas_token))
			.then(res => this.zeroKitAdapter.decrypt(res.content));
	}

	uploadDocument(hcUsername, document, options = {}) {
		const params = {
			organization_id: options.organisationId || '',
			title: options.title || '',
			document_type: options.documentType || '',
			custom_fields: options.customFields || '',
			comment: options.comments || '',
		};
		let documentId;

		return Promise.all(
			[
				this.zeroKitAdapter.encrypt(document),
				documentRoutes.getUploadUserDocumentSAS(hcUsername, params),
			],
		)
			.then((results) => {
				const encryptedDocument = results[0];
				const sasToken = results[1].sas_token;
				documentId = results[1].document_id;

				return azureRoutes.uploadDocument(sasToken, encryptedDocument);
			})
			.then(() => {
				const responseParams = { document_status: 'active' };
				return documentRoutes.changeUserDocument(hcUsername, documentId, responseParams);
			})
			.then(() => ({ document_id: documentId }));
	}
}

export default DocumentService;
