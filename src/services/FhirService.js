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

	updateFhirRecord(recordId, fhirObject) {
		const updateRequest =
			(userId, params) => documentRoutes.updateRecord(userId, recordId, params);

		return this.downloadFhirRecord(recordId)
			.then((record) => {
				const updatedFhirObject = Object.assign(record.body, fhirObject);
				return this.uploadFhirRecord(updatedFhirObject, updateRequest);
			});
	}

	createFhirRecord(fhirObject) {
		return this.uploadFhirRecord(fhirObject, documentRoutes.createRecord);
	}

	uploadFhirRecord(fhirObject, uploadRequest) {
		return fhirValidator.validate(fhirObject)
			.then(() => {
				const tags = taggingUtils.generateTagsFromFhirObject(fhirObject);
				return this.uploadRecord(fhirObject, tags, uploadRequest);
			});
	}

	uploadRecord(doc, tags, uploadRequest) {
		return Promise.all(
			[
				this.zeroKitAdapter.encrypt(JSON.stringify(doc)),
				UserService.resolveUser()
					.then(user => this.zeroKitAdapter.decrypt(user.tag_encryption_key))
					.then(tagEncryptionKey => tags
						.map(tag => encryptionUtils.encrypt(tag, tagEncryptionKey))),
			],
		)
			.then((results) => {
				const params = {
					encrypted_body: results[0],
					encrypted_tags: results[1],
					date: dateUtils.formatDateYyyyMmDd(new Date()),
				};
				return uploadRequest(UserService.getUserId(), params);
			})
			.then((result) => {
				delete result.encrypted_body;
				delete result.encrypted_tags;
				result.body = doc;
				result.tags = tags;
				return result;
			});
	}


	downloadFhirRecord(recordId) {
		return documentRoutes.downloadRecord(UserService.getUserId(), recordId)
			.then(result => Promise.all([
				this.zeroKitAdapter.decrypt(result.encrypted_body),
				UserService.resolveUser()
					.then(user => this.zeroKitAdapter.decrypt(user.tag_encryption_key))
					.then(tek => result.encrypted_tags
						.map(tag => encryptionUtils.decrypt(tag, tek))),
			])
				.then((results) => {
					delete result.encrypted_body;
					delete result.encrypted_tags;
					result.body = JSON.parse(results[0]);
					result.tags = results[1];
					return result;
				}));
	}

	searchRecords(params) {
		let tek;
		return UserService.resolveUser()
			.then(res => this.zeroKitAdapter.decrypt(res.tag_encryption_key))
			.then((tagEncryptionKey) => {
				tek = tagEncryptionKey;
				if (params.tags) {
					params.tags = params.tags
						.map(tag => encryptionUtils.encrypt(tag, tek)).join(',');
				}
				if (params.user_ids) {
					params.user_ids = params.user_ids.join(',');
				}
				return params;
			})
			.then(queryParams => documentRoutes.searchRecords(queryParams))
			.then((searchResults) => {
				const promises = searchResults.map(result => Promise.all(
					[
						this.zeroKitAdapter.decrypt(result.encrypted_body),
						result.encrypted_tags.map(item => encryptionUtils.decrypt(item, tek)),
					])
					.then((results) => {
						delete result.encrypted_body;
						delete result.encrypted_tags;
						result.body = JSON.parse(results[0]);
						result.tags = results[1];
						return result;
					}),
				);
				return Promise.all(promises);
			});
	}

	deleteRecord(documentId, userId = undefined) {
		if (!userId) userId = UserService.getUserId();

		return documentRoutes.deleteRecord(userId, documentId);
	}
}

export default FHIRService;
