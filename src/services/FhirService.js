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
				const tags = taggingUtils.generateTagsFromFhirObject(fhirObject);
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
			.then(result => Promise.all([
				this.zeroKitAdapter.decrypt(result.encrypted_body),
				UserService.getInternalUser()
					.then(user => result.encrypted_tags
						.map(tag => encryptionUtils.decrypt(tag, user.tek))),
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
		let user;

		return UserService.getInternalUser()
			.then((userObject) => {
				user = userObject;
				if (params.tags) {
					params.tags = params.tags
						.map(tag => encryptionUtils.encrypt(tag, user.tek)).join(',');
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
						result.encrypted_tags.map(item => encryptionUtils.decrypt(item, user.tek)),
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

	deleteRecord(ownerId, recordId) {
		if (!ownerId) ownerId = UserService.getCurrentUser().id;

		return documentRoutes.deleteRecord(ownerId, recordId);
	}
}

export default FHIRService;
