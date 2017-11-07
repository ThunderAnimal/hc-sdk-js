import documentRoutes from '../routes/documentRoutes';
import azureRoutes from '../routes/azureRoutes';
import FhirService from './FhirService';

class DocumentService {
	constructor(options = {}) {
		this.zeroKitAdapter = options.zeroKitAdapter;
		this.fhirService = new FhirService({ zeroKitAdapter: this.zeroKitAdapter });
	}

	downloadDocument(userId, documentId) {
		let documentRecord;
		return this.fhirService.downloadFhirRecord(documentId)
			.then((res) => {
				documentRecord = res;
				return Promise.all(
					documentRecord.body.content.map(
						(documentReference) => {
							const fileId = documentReference.attachment.url;
							return documentRoutes
								.getFileDownloadUrl(userId, documentId, fileId);
						}));
			})
			.then(sasUrls => Promise.all(
				sasUrls.map(sasUrl => azureRoutes.downloadFile(sasUrl.sas_token))))
			.then(encryptedFiles => Promise.all(
				encryptedFiles.map(encryptedFile =>
					this.zeroKitAdapter.decrypt(encryptedFile.content)),
			))
			.then((files) => {
				documentRecord.files = files;
				return documentRecord;
			});
	}

	uploadDocument(userId, files, metadata = {}, customTags = []) {
		customTags = [...customTags, ...['type:document']];
		return this.fhirService.createFhirRecord(metadata, customTags)
			.then(record => this.addFilesToRecord(record, userId, files));
	}

	addFilesToDocument(userId, documentId, files) {
		return this.fhirService.downloadFhirRecord(documentId)
			.then(record => this.addFilesToRecord(record, userId, files));
	}

	addFilesToRecord(documentRecord, userId, files) {
		let fileInformation;
		files = files.map(file =>
			this.zeroKitAdapter.encrypt(file.data)
				.then(encryptedData =>
					({ data: encryptedData, title: file.title })));

		return Promise.all([
			Promise.all(files),
			documentRoutes.getFileUploadUrls(userId, documentRecord.record_id, files.length),
		])
			.then((result) => {
				const encryptedFiles = result[0];
				fileInformation = result[1];
				return Promise.all(encryptedFiles
					.map((encryptedFile, index) =>
						azureRoutes
							.uploadFile(fileInformation[index].sas_token, encryptedFile.data)));
			})
			.then(() => {
				const newAtachements = fileInformation
					.map((info, index) =>
						this.createDocumentReference(info.id, files[index].title));
				documentRecord.body.content.push(...newAtachements);
				return this.fhirService.updateFhirRecord(
					documentRecord.record_id,
					documentRecord.body,
					documentRecord.tags,
				);
			});
	}

	deleteFilesFromDocument(userId, documentId, fileIds) {
		return this.fhirService.downloadFhirRecord(documentId)
			.then((record) => {
				record.body.content = record.body.content.filter(documentReference =>
					fileIds.indexOf(documentReference.attachment.url) === -1);
				return this.fhirService.updateFhirRecord(documentId, record.body);
			});
	}

	updateDocumentMetadata(recordId, jsonFHIR, tags = []) {
		// don't update the content as it is internally handled by SDK
		if (jsonFHIR.content) delete jsonFHIR.content;
		return this.fhirService.updateFhirRecord(recordId, jsonFHIR, tags);
	}

	createDocumentReference(fileId, title) {
		return { attachment: { url: fileId, title } };
	}
}

export default DocumentService;
