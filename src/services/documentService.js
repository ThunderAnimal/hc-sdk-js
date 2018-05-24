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

    /**
     * Downloads the document with given owner and documentId with all its files.
     *
     * @param {String} ownerId - the id of the owner of the document
     * @param {String} documentId - the id of the document
     * @returns {Promise<hcDocument>} the requested hcDocument
     */
    downloadDocument(ownerId, documentId) {
        let hcDocument;
        let encryptedAttachmentKey;
        return this.fhirService.downloadFhirRecord(ownerId, documentId)
            .then((record) => {
                hcDocument = hcDocumentUtils.fromFhirObject(record.body);
                hcDocument.client = taggingUtils.getTagValueFromList(record.tags,
                    tagKeys.client);
                hcDocument.annotations = taggingUtils.getAnnotations(record.tags);
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

    /**
     * Uploads a document to a users GesundheitsCloud
     * @param {String} ownerId - the id of the owner of the document
     * @param {hcDocument} hcDocument - the hcDocument that should be uploaded
     * @returns {Promise<hcDocument>} - the uploaded hcDocument with id and attachmentIds
     */
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

    /**
     * Updates a hcDocument. Changing attachments files is not possible,
     * but uploading new attachments and removing old ones.
     * @param {String} ownerId - the id of the owner of the document
     * @param {hcDocument} hcDocument - the updated hcDocument.
     * @returns {Promise<hcDocument>} - the updated hcDocument.
     */
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

    /**
     * Deletes the hcDocument
     * @param {String} ownerId - the id of the owner of the hcDocument
     * @param {String} documentId - the id of the hcDocument that should be deleted
     */
    deleteDocument(ownerId, documentId) {
        return this.fhirService.deleteRecord(ownerId, documentId);
    },

    /**
     * returns the metadata(everyting but the files) of the matching hcDocuments
     * @param {String} ownerId - the id of the owner of the hcDocument
     * @param {Object} params - search parameters check in sdk.md for more information
     * @returns {Object} documents
     * @returns {Number} documents.totalCount - the total number of matching documents
     * @returns {Array<hcDocument>} documents.records - the matching records
     */
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

    /**
     * Returns the number of elements that match the params
     * @param {String} ownerId - the id of the owner of the hcDocument
     * @param {Object} params - search parameters check in sdk.md for more information
     * @returns {Number} the number of hcDocuments that match the params
     */
    getDocumentsCount(ownerId, params = {}) {
        params.tags = [taggingUtils.buildTag('resourceType', 'documentReference')];
        return this.fhirService.searchRecords(ownerId, params, true)
            .then(res => res.totalCount);
    },
};

export default documentService;
