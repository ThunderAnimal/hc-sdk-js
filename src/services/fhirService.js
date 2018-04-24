import fhirValidator from '../lib/fhirValidator';
import documentRoutes from '../routes/documentRoutes';
import userService from './userService';
import taggingUtils from '../lib/taggingUtils';
import dateUtils from '../lib/dateUtils';
import hcCrypto from '../lib/crypto';


const FHIRService = {
    updateFhirRecord(ownerId, recordId, fhirObject, attachmentKey = null) {
        const updateRequest =
            (userId, params) => documentRoutes.updateRecord(userId, recordId, params);

        return this.downloadFhirRecord(ownerId, recordId)
            .then((record) => {
                const updatedFhirObject = Object.assign(record.body, fhirObject);
                return this.uploadFhirRecord(
                    ownerId, updatedFhirObject, updateRequest, attachmentKey);
            });
    },

    createFhirRecord(ownerId, fhirObject) {
        return this.uploadFhirRecord(ownerId, fhirObject, documentRoutes.createRecord);
    },

    uploadFhirRecord(ownerId, fhirResource, uploadRequest, attachmentKey) {
        return fhirValidator.validate(fhirResource)
            .then(() => {
                const tags = [
                    ...taggingUtils.generateTags(fhirResource),
                ];
                return this.uploadRecord(ownerId, fhirResource, tags, uploadRequest, attachmentKey);
            });
    },

    uploadRecord(ownerId, resource, tags, uploadRequest, attachmentKey) {
        let owner;
        return userService.getInternalUser(ownerId)
            .then((user) => {
                owner = user;
                return Promise.all([
                    this.encryptionService(owner.id).encryptObject(resource),
                    Promise.all(tags.map(tag => hcCrypto.symEncryptString(owner.tek, tag))),
                ]);
            })
            .then((results) => {
                const dataIndex = 0;
                const keyIndex = 1;
                const params = {
                    encrypted_body: results[0][dataIndex],
                    encrypted_key: results[0][keyIndex],
                    encrypted_tags: results[1],
                    date: dateUtils.formatDateYyyyMmDd(new Date()),
                    attachment_key: attachmentKey,
                };
                return uploadRequest(owner.id, params);
            })
            .then(result => ({
                body: resource,
                tags,
                date: result.date,
                record_id: result.record_id,
            }));
    },


    downloadFhirRecord(ownerId, recordId) {
        return documentRoutes.downloadRecord(ownerId, recordId)
            .then(result => userService.getInternalUser()
                .then(user => this.decryptRecordAndTags(result, user.tek)));
    },

    searchRecords(ownerId, params, countOnly = false) {
        let user;
        let totalCount;

        return userService.getInternalUser()
            .then((userObject) => {
                user = userObject;
                if (params.client_id) {
                    const clientTag = taggingUtils.buildTag('client', params.client_id);
                    params.tags = params.tags ?
                        [...params.tags, clientTag] :
                        [clientTag];
                    delete params.client_id;
                }

                if (params.tags) {
                    return Promise.all(params.tags
                        .map(tag => hcCrypto.symEncryptString(user.tek, tag)))
                        .then(encryptedTags => encryptedTags.join(','))
                        .then((tags) => {
                            params.tags = tags;
                            return params;
                        });
                }
                return params;
            })
            .then((queryParams) => {
                if (countOnly) {
                    return documentRoutes.getRecordsCount(user.id, queryParams);
                }
                return documentRoutes.searchRecords(user.id, queryParams);
            })
            .then((searchResult) => {
                totalCount = searchResult.totalCount;
                return searchResult.records
                    ? Promise.all(searchResult.records.map(result =>
                        this.decryptRecordAndTags(result, user.tek)))
                    : undefined;
            })
            .then(results => (results
                ? { totalCount, records: results }
                : { totalCount }));
    },

    deleteRecord(ownerId, recordID) {
        const id = ownerId || userService.getCurrentUser().id;

        return documentRoutes.deleteRecord(id, recordID);
    },

    decryptRecordAndTags(record, tek) {
        const tagsPromise = Promise.all(record.encrypted_tags.map(tag =>
            hcCrypto.symDecryptString(tek, tag)));

        const recordPromise = this.encryptionService(record.userId)
            .decryptData(
                record.encrypted_key,
                hcCrypto.convertBase64ToArrayBufferView(record.encrypted_body))
            .then(hcCrypto.convertArrayBufferViewToString)
            .then(JSON.parse);
        return Promise.all([
            recordPromise,
            tagsPromise,
        ])
            .then(results => ({
                body: results[0],
                tags: results[1],
                record_id: record.record_id,
            }));
    },
};

export default FHIRService;
