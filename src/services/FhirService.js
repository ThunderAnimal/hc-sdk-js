import fhirValidator from '../lib/fhirValidator';
import documentRoutes from '../routes/documentRoutes';
import UserService from '../services/UserService';
import taggingUtils from '../lib/taggingUtils';
import encryptionUtils from '../lib/EncryptionUtils';
import dateUtils from '../lib/dateUtils';

class FHIRService {
    constructor(options = {}) {
        this.zeroKitAdapter = options.zeroKitAdapter;
    }

    updateFhirRecord(ownerId, recordId, fhirObject) {
        const updateRequest =
            (userId, params) => documentRoutes.updateRecord(userId, recordId, params);

        return this.downloadFhirRecord(ownerId, recordId)
            .then((record) => {
                const updatedFhirObject = Object.assign(record.body, fhirObject);
                return this.uploadFhirRecord(ownerId, updatedFhirObject, updateRequest);
            });
    }

    createFhirRecord(ownerId, fhirObject) {
        return this.uploadFhirRecord(ownerId, fhirObject, documentRoutes.createRecord);
    }

    uploadFhirRecord(ownerId, fhirObject, uploadRequest) {
        return fhirValidator.validate(fhirObject)
            .then(() => {
                const tags = [
                    ...taggingUtils.generateTagsFromFhirObject(fhirObject),
                    taggingUtils.buildTag('client', this.zeroKitAdapter.authService.clientId),
                ];
                return this.uploadRecord(ownerId, fhirObject, tags, uploadRequest);
            });
    }

    uploadRecord(ownerId, doc, tags, uploadRequest) {
        let owner;
        return UserService.getInternalUser(ownerId)
            .then((user) => {
                owner = user;
                return Promise.all([
                    this.zeroKitAdapter.encrypt(owner.id, JSON.stringify(doc)),
                    tags.map(tag => encryptionUtils.encrypt(tag, owner.tek)),
                ]);
            })
            .then((results) => {
                const params = {
                    encrypted_body: results[0],
                    encrypted_tags: results[1],
                    date: dateUtils.formatDateYyyyMmDd(new Date()),
                };
                return uploadRequest(owner.id, params);
            })
            .then((result) => {
                delete result.encrypted_body;
                delete result.encrypted_tags;
                result.body = doc;
                result.tags = tags;
                return result;
            });
    }

    downloadFhirRecord(ownerId, recordId) {
        return documentRoutes.downloadRecord(ownerId, recordId)
            .then(result => UserService.getInternalUser()
                .then(user => this.decryptRecordAndTags(result, user.tek)));
    }

    searchRecords(ownerId, params, countOnly = false) {
        let user;
        let totalCount;

        return UserService.getInternalUser()
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
                    params.tags = params.tags
                        .map(tag => encryptionUtils.encrypt(tag, user.tek)).join(',');
                }

                return params;
            })
            .then((queryParams) => {
                if (countOnly) {
                    return documentRoutes.getRecordsCount(ownerId, queryParams);
                }
                return documentRoutes.searchRecords(ownerId, queryParams);
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
    }

    deleteRecord(ownerId, recordId) {
        if (!ownerId) ownerId = UserService.getCurrentUser().id;

        return documentRoutes.deleteRecord(ownerId, recordId);
    }

    decryptRecordAndTags(record, tek) {
        return Promise.all([
            this.zeroKitAdapter.decrypt(record.encrypted_body),
            record.encrypted_tags.map(tag => encryptionUtils.decrypt(tag, tek)),
        ])
            .then(results => ({
                body: JSON.parse(results[0]),
                tags: results[1],
                record_id: record.record_id,
            }));
    }
}

export default FHIRService;
