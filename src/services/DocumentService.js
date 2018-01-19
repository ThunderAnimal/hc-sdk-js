import documentRoutes from '../routes/documentRoutes';
import fileRoutes from '../routes/fileRoutes';
import FhirService from './FhirService';
import taggingUtils from '../lib/taggingUtils';
import hcDocumentUtils from '../lib/models/utils/hcDocumentUtils';
import ValidationError from '../lib/errors/ValidationError';

class DocumentService {
    constructor(options = {}) {
        this.zeroKitAdapter = options.zeroKitAdapter;
        this.fhirService = new FhirService({ zeroKitAdapter: this.zeroKitAdapter });
    }

    downloadDocument(ownerId, documentId) {
        let hcDocument;
        return this.fhirService.downloadFhirRecord(ownerId, documentId)
            .then((record) => {
                hcDocument = hcDocumentUtils.fromFhirObject(record.body);
                return Promise.all(
                    hcDocument.attachments.map(attachment =>
                        documentRoutes.getFileDownloadUrl(ownerId, documentId, attachment.id)),
                );
            })
            .then(sasUrls => Promise.all(
                sasUrls.map(sasUrl => fileRoutes.downloadFile(sasUrl.sas_token))))
            .then(encryptedBlobs => Promise.all(
                encryptedBlobs.map(encryptedBlob => this.zeroKitAdapter.decryptBlob(encryptedBlob)),
            ))
            .then((blobs) => {
                let attachment;
                return blobs.map((blob, index) => {
                    attachment = hcDocument.attachments[index];
                    attachment.file = new File([blob], attachment.title, {
                        type: attachment.type,
                        lastModifiedDate: attachment.creation,
                    });
                    return attachment;
                });
            })
            .then((attachments) => {
                hcDocument.attachments = attachments;
                hcDocument.id = documentId;
                return hcDocument;
            });
    }

    uploadDocument(ownerId, hcDocument) {
        if (!hcDocumentUtils.isValid(hcDocument)) {
            return Promise.reject(new ValidationError('Not a valid hcDocument'));
        }

        return this.fhirService.createFhirRecord(ownerId, hcDocumentUtils.toFhirObject(hcDocument))
            .then((record) => {
                hcDocument.id = record.record_id;
                return this.updateDocument(ownerId, hcDocument);
            });
    }

    updateDocument(ownerId, hcDocument) {
        if (!hcDocumentUtils.isValid(hcDocument)) {
            return Promise.reject(new ValidationError('Not a valid hcDocument'));
        }

        let newAttachments = [];
        const oldAttachments = [];
        hcDocument.attachments.forEach((attachment) => {
            if (attachment.id) {
                oldAttachments.push(attachment);
            } else {
                newAttachments.push(attachment);
            }
        });

        newAttachments = newAttachments.map(attachment =>
            this.zeroKitAdapter.encryptBlob(ownerId, attachment.file)
                .then(encryptedBlob => ({ attachment, encryptedData: encryptedBlob })));

        return Promise.all([
            Promise.all(newAttachments),
            newAttachments.length ?
                documentRoutes.getFileUploadUrls(ownerId, hcDocument.id, newAttachments.length) :
                Promise.resolve([]),
        ])
            .then((result) => {
                newAttachments = result[0];
                const uploadInformation = result[1];
                return Promise.all(
                    newAttachments.map((attachment, index) => {
                        attachment.attachment.id = uploadInformation[index].id;
                        return fileRoutes
                            .uploadFile(
                                uploadInformation[index].sas_token,
                                attachment.encryptedData);
                    }),
                );
            })
            .then(() => {
                newAttachments = newAttachments.map(attachment => attachment.attachment);
                hcDocument.attachments = [...oldAttachments, ...newAttachments];
                return this.fhirService.updateFhirRecord(
                    ownerId,
                    hcDocument.id,
                    hcDocumentUtils.toFhirObject(hcDocument));
            })
            .then(() => hcDocument);
    }

    deleteDocument(ownerId, hcDocument) {
        return this.FhirService.deleteRecord(ownerId, hcDocument.id);
    }

    getDocuments(ownerId, params = {}) {
        params.tags = [taggingUtils.buildTag('resourceType', 'documentReference')];
        return this.fhirService.searchRecords(ownerId, params)
            .then((result) => {
                result.records = result.records.map((record) => {
                    const hcDocument = hcDocumentUtils.fromFhirObject(record.body);
                    hcDocument.id = record.record_id;
                    return hcDocument;
                });
                return result;
            });
    }

    getDocumentsCount(ownerId, params = {}) {
        params.tags = [taggingUtils.buildTag('resourceType', 'documentReference')];
        return this.fhirService.searchRecords(ownerId, params, true);
    }
}

export default DocumentService;
