import documentRoutes from '../routes/documentRoutes';
import azureRoutes from '../routes/azureRoutes';
import FhirService from './FhirService';

class DocumentService {
	constructor(options = {}) {
		this.zeroKitAdapter = options.zeroKitAdapter;
		this.fhirService = new FhirService({ zeroKitAdapter: this.zeroKitAdapter });
	}

	downloadDocument(userId, documentId) {
		return Promise.all(
			[
				documentRoutes.getDownloadUserDocumentToken(userId, documentId)
					.then(res => azureRoutes.downloadDocument(res.sas_token))
					.then(res => this.zeroKitAdapter.decrypt(res.content)),
				this.fhirService.downloadFhirRecord(documentId),
			],
		)
			.then(results => Object.assign({}, { document: results[0] }, results[1]));
	}

	uploadDocument(userId, document, options = {}) {
		let recordId;
		return Promise.all(
			[
				this.zeroKitAdapter.encrypt(document),
				this.fhirService.uploadFhirRecord(options, ['document'])
					.then((res) => {
						recordId = res.record_id;
						return documentRoutes.getUploadUserDocumentToken(userId, recordId);
					}),
			],
		)
			.then((results) => {
				const encryptedDocument = results[0];
				const sasToken = results[1].sas_token;

				return azureRoutes.uploadDocument(sasToken, encryptedDocument);
			})
			.then(() => documentRoutes.updateRecordStatus(userId, recordId, 'Active'))
			.then(() => ({ record_id: recordId }));
	}
}

export default DocumentService;
