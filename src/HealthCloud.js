import AbstractHealthCloud from './AbstractHealthCloud';
import ZeroKitAdapter from './ZeroKitAdapter';
import arcturusRoutes from './routes/arcturusRoutes';
import azureRoutes from './routes/azureRoutes';


class HealthCloud extends AbstractHealthCloud {

	constructor(options) {
		super(options);
		this.zeroKitAdapter = new ZeroKitAdapter(options);
		this.getLoginFrame = this.zeroKitAdapter.getLoginFrame.bind(this.zeroKitAdapter);
		this.getRegistrationFrame = this.zeroKitAdapter.getRegistrationFrame.bind(this.zeroKitAdapter);
	}

	// TODO write arcturusAdapter
	getDocument(hcUsername, documentId) {
		arcturusRoutes.getUserDocumentSAS(hcUsername, documentId)
			.then(res => azureRoutes.getDocument(res.sas_token))
			.then(res => this.zeroKitAdapter.decrypt(res.content))
			.catch(error =>	console.log(error));
	}

	uploadDocument(hcUsername, document, options = {}) {
		let params = {
			organizationId: options.organisationId || '',
			title: options.title || '',
			docType: options.docType || '',
			customFields: options.customFields || '',
			comment: options.comments || '',
		};

        // TODO Error handling
		let documentId;
		arcturusRoutes.getUploadUserDocumentSAS(hcUsername, params)
			.then((res) => {
			// const tresorId = '0000armv60emmos7sirglqoq';
			// const encryptedDocument = this.zeroKitAdapter.encrypt(document);
				documentId = res.document_id;
				return azureRoutes.uploadDocument(res.sas_token, document);
			})
			.then((res) => {
				console.log('test');
				let responseParams = {
					documentStatus: 'active',
				};
				return arcturusRoutes.getChangeUserDocumentSAS(hcUsername, documentId, responseParams);
			})
		;
	}
}

module.exports = HealthCloud;

