import documentRoutes from '../routes/documentRoutes';
import fileRoutes from '../routes/fileRoutes';
import FhirService from './FhirService';
import dateHelper from '../lib/dateHelper';

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
							const fileId = documentReference.attachment.id;
							return documentRoutes
								.getFileDownloadUrl(userId, documentId, fileId);
						}));
			})
			.then(sasUrls => Promise.all(
				sasUrls.map(sasUrl => fileRoutes.downloadFile(sasUrl.sas_token))))
			.then(encryptedBlobs => Promise.all(
				encryptedBlobs.map(encryptedBlob => this.zeroKitAdapter.decryptBlob(encryptedBlob)),
			))
			.then((blobs) => {
				let attachment;
				return blobs.map((blob, index) => {
					attachment = documentRecord.body.content[index].attachment;
					return new File([blob], attachment.title, {
						type: attachment.contentType,
						lastModifiedDate: new Date(attachment.creation),
					});
				});
			})
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
		let uploadInformation;

		files = files.map(file => this.zeroKitAdapter.encryptBlob(file)
			.then(encryptedBlob => ({
				data: encryptedBlob,
				title: file.name,
				type: file.type,
				lastModified: (file.lastModifiedDate || new Date()).toISOString(),
			})));

		return Promise.all([
			Promise.all(files),
			documentRoutes.getFileUploadUrls(userId, documentRecord.record_id, files.length),
		])
			.then((result) => {
				files = result[0];
				uploadInformation = result[1];
				return Promise.all(
					files
						.map((encryptedFile, index) => fileRoutes
							.uploadFile(uploadInformation[index].sas_token, encryptedFile.data)),
				);
			})
			.then(() => {
				const attachments = uploadInformation
					.map((info, index) =>
						this.createDocumentReference(info.id,
							files[index].title,
							files[index].type,
							files[index].lastModified));
				documentRecord.body.content.push(...attachments);
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

	createDocumentReference(fileId, title, contentType, creation) {
		return {
			attachment: {
				id: fileId,
				title,
				contentType,
				creation,
			},
		};
	}
}

export default DocumentService;
