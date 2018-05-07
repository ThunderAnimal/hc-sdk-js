import documentRoutes from '../routes/documentRoutes';
import fileRoutes from '../routes/fileRoutes';
import fhirService from './fhirService';
import taggingUtils, { tagKeys } from '../lib/taggingUtils';
import hcDocumentUtils from '../lib/models/utils/hcDocumentUtils';
import ValidationError from '../lib/errors/ValidationError';
import hcCrypto from '../lib/crypto';
import createCryptoService from './cryptoService';

const documentService = {
    fhirService,

    downloadDocument(ownerId, documentId) {
        let hcDocument;
        let encryptedAttachmentKey;
        return this.fhirService.downloadFhirRecord(ownerId, documentId)
            .then((record) => {
                hcDocument = hcDocumentUtils.fromFhirObject(record.body);
                encryptedAttachmentKey = record.attachment_key;
                return Promise.all(
                    hcDocument.attachments.map(attachment =>
                        documentRoutes
                            .getFileDownloadUrl(ownerId, documentId, attachment.id)),
                );
            })
            .then(sasUrls => Promise.all(
                sasUrls.map(sasUrl => fileRoutes.downloadFile(sasUrl.sas_token)
                    .then(hcCrypto.convertBlobToArrayBufferView))))
            .then(encryptedData => Promise.all(
                encryptedData.map(data =>
                    createCryptoService(ownerId)
                        .decryptData(encryptedAttachmentKey, data))))
            .then((dataArray) => {
                let attachment;
                return dataArray.map((data, index) => {
                    attachment = hcDocument.attachments[index];
                    attachment.file = new File([data], attachment.title, {
                        type: attachment.type,
                        lastModifiedData: attachment.creation,
                    });
                    return attachment;
                });
            })
            .then((attachments) => {
                hcDocument.attachments = attachments;
                hcDocument.id = documentId;
                return hcDocument;
            });
    },

    uploadDocument(ownerId, hcDocument) {
        if (!hcDocumentUtils.isValid(hcDocument)) {
            return Promise.reject(new ValidationError('Not a valid hcDocument'));
        }

        return this.fhirService.createFhirRecord(
            ownerId,
            hcDocumentUtils.toFhirObject(hcDocument, this.clientId),
        )
            .then((record) => {
                hcDocument.id = record.record_id;
                return this.updateDocument(ownerId, hcDocument);
            });
    },

    updateDocument(ownerId, hcDocument) {
        if (!hcDocumentUtils.isValid(hcDocument)) {
            return Promise.reject(new ValidationError('Not a valid hcDocument'));
        }

        let attachmentKey;

        const newAttachments = [];
        const oldAttachments = [];
        hcDocument.attachments.forEach((attachment) => {
            if (attachment.id) {
                oldAttachments.push(attachment);
            } else {
                newAttachments.push(attachment);
            }
        });

        const recordPromise =
            documentRoutes.downloadRecord(ownerId, hcDocument.id);

        const encryptedFilesPromise = recordPromise
            .then(record => createCryptoService(ownerId).encryptBlobs(
                newAttachments.map(attachment => attachment.file),
                record.attachment_key,
            ));

        return Promise.all([
            encryptedFilesPromise,
            newAttachments.length ?
                documentRoutes.getFileUploadUrls(ownerId, hcDocument.id, newAttachments.length) :
                Promise.resolve([]),
        ])
            .then(([fileEncryptionResult, uploadInformation]) => {
                if (fileEncryptionResult && fileEncryptionResult[1]) {
                    attachmentKey = fileEncryptionResult[1];
                }
                const uploadFilePromise = Promise.all(
                    fileEncryptionResult[0].map((encryptedBlob, index) => {
                        newAttachments[index].id = uploadInformation[index].id;
                        return fileRoutes.uploadFile(
                            uploadInformation[index].sas_token,
                            encryptedBlob);
                    }));
                return uploadFilePromise;
            })
            .then(() => {
                const customTags = hcDocument.annotations
                    ? taggingUtils.generateCustomTags(hcDocument.annotations)
                    : [];
                hcDocument.attachments = [...oldAttachments, ...newAttachments];
                return this.fhirService.updateFhirRecord(
                    ownerId,
                    hcDocument.id,
                    hcDocumentUtils.toFhirObject(hcDocument, this.clientId),
                    customTags,
                    attachmentKey,
                );
            })
            .then(() => hcDocument);
    },

    deleteDocument(ownerId, documentId) {
        return this.fhirService.deleteRecord(ownerId, documentId);
    },

    getDocuments(ownerId, params = {}) {
        params.tags = [taggingUtils.buildTag('resourceType', 'documentReference')];
        return this.fhirService.searchRecords(ownerId, params)
            .then((result) => {
                result.records = result.records.map((record) => {
                    const hcDocument = hcDocumentUtils.fromFhirObject(record.body);
                    hcDocument.client = taggingUtils.getTagValueFromList(record.tags,
                        tagKeys.client);
                    hcDocument.annotations = taggingUtils.getAnnotations(record.tags);
                    hcDocument.id = record.record_id;
                    return hcDocument;
                });
                return result;
            });
    },

    getDocumentsCount(ownerId, params = {}) {
        params.tags = [taggingUtils.buildTag('resourceType', 'documentReference')];
        return this.fhirService.searchRecords(ownerId, params, true)
            .then(res => res.totalCount);
    },
};

export default documentService;
