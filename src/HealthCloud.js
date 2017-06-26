import AbstractHealthCloud from './AbstractHealthCloud';
import ZeroKitAdapter from './ZeroKitAdapter';
import arcturusRoutes from './arcturusRoutes';
import azureRoutes from './azureRoutes';


class HealthCloud extends AbstractHealthCloud {

	constructor(options) {
		super(options);
		let zeroKitAdapter = new ZeroKitAdapter();
		this.getLoginFrame = zeroKitAdapter.getLoginFrame.bind(zeroKitAdapter);
		this.getRegistrationFrame = zeroKitAdapter.getRegistrationFrame.bind(zeroKitAdapter);
	}

	// TODO write arcturusAdapter
	getDocument(hcUsername, documentId) {
		arcturusRoutes.getUserDocumentSAS(hcUsername, documentId)
			.then(sasUrl => azureRoutes.getDocument(sasUrl))
			.then(encryptedBlob => console.log(this.zeroKitAdapter.decrypt(encryptedBlob)))
			.catch(error =>	console.log(error));
	}

	uploadDocument(hcUsername, documentId, document) {
		arcturusRoutes.getUploadUserDocumentSAS(hcUsername, documentId).then((sasUrl) => {
			const tresorId = '0000armv60emmos7sirglqoq';
			const encryptedDocument = this.zeroKitAdapter.encrypt(document);
			console.log(encryptedDocument);
			azureRoutes.uploadDocument(sasUrl, encryptedDocument);
		});
	}
}

export default HealthCloud;
