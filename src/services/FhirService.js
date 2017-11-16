import fhirValidator from '../lib/fhirValidator';
import documentRoutes from '../routes/documentRoutes';
import UserService from '../services/UserService';
import Tags from '../lib/Tags';
import encryptionUtils from '../lib/EncryptionUtils';
import dateHelper from '../lib/dateHelper';

class FHIRService {
	constructor(options = {}) {
		this.zeroKitAdapter = options.zeroKitAdapter;
	}

	updateFhirRecord(recordId, jsonFHIR, tags = []) {
		const updateRequest =
			(userId, params) => documentRoutes.updateRecord(userId, recordId, params);

		return this.downloadFhirRecord(recordId)
			.then((res) => {
				const newFhirJson = Object.assign(res.body, jsonFHIR);
				return this.uploadFhirRecord(newFhirJson, tags, updateRequest);
			});
	}

	createFhirRecord(jsonFhir, tags = []) {
		return this.uploadFhirRecord(jsonFhir, tags, documentRoutes.createRecord);
	}

	uploadFhirRecord(jsonFHIR, tags, uploadRequest) {
		return fhirValidator.validate(jsonFHIR)
			.then(() => {
				tags = [...tags, ...(new Tags()).createTagsFromFHIR(jsonFHIR)];
				return this.uploadRecordWithTags(jsonFHIR, tags, uploadRequest);
			});
	}

	uploadRecordWithTags(doc, tags, uploadRequest) {
		return Promise.all(
			[
				this.zeroKitAdapter.encrypt(JSON.stringify(doc)),
				UserService.resolveUser()
					.then(res => this.zeroKitAdapter.decrypt(res.tag_encryption_key))
					.then(res => tags
						.map(item => encryptionUtils.encrypt(item.toLowerCase().trim(), res))),
			],
		)
			.then((results) => {
				const params = {
					encrypted_body: results[0],
					encrypted_tags: results[1],
					date: dateHelper.formatDateYyyyMmDd(new Date()),
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
						.map(item => encryptionUtils.encrypt(item.toLowerCase(), tek)).join(',');
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
						result.body = results[0];
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
