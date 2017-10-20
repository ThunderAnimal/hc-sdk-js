import fhirValidator from '../lib/fhirValidator';
import documentRoutes from '../routes/documentRoutes';
import UserService from '../services/UserService';
import Tags from '../lib/Tags';
import encryptionUtils from '../lib/EncryptionUtils';
import helpers from '../lib/dateHelper';

class FHIRService {
	constructor(options = {}) {
		this.zeroKitAdapter = options.zeroKitAdapter;
	}

	updateFhirRecord(recordId, jsonFHIR, tags = []) {
		const updateRequest =
			(userId, params) => documentRoutes.updateRecord(userId, recordId, params);

		return this.uploadFhirRecord(jsonFHIR, tags, updateRequest);
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
					date: helpers.formatDateYyyyMmDd(new Date()),
				};
				return uploadRequest(UserService.getUserId(), params);
			});
	}


	downloadFhirRecord(recordId) {
		return documentRoutes.downloadRecord(UserService.getUserId(), recordId)
			.then(result => Promise.all(
				[
					this.zeroKitAdapter.decrypt(result.encrypted_body),
					UserService.resolveUser()
						.then(res => this.zeroKitAdapter.decrypt(res.tag_encryption_key))
						.then(res => result.encrypted_tags
							.map(item => encryptionUtils.decrypt(item, res))),
				],
			)
				.then((results) => {
					result.body = JSON.parse(results[0]);
					result.tags = results[1];
					return result;
				}),
			);
	}


	searchRecords(params) {
		let tek;
		return UserService.resolveUser()
			.then(res => this.zeroKitAdapter.decrypt(res.tag_encryption_key))
			.then((res) => {
				tek = res;
				if (params.tags) {
					params.tags = params.tags
						.map(item => encryptionUtils.encrypt(item.toLowerCase(), res)).join(',');
				}
				if (params.user_ids) {
					params.user_ids = params.user_ids.join(',');
				}
				return params;
			})
			.then(res => documentRoutes.searchRecords(params))
			.then((res) => {
				const promises = res.map(result => Promise.all(
					[
						this.zeroKitAdapter.decrypt(result.encrypted_body),
						result.encrypted_tags.map(item => encryptionUtils.decrypt(item, tek)),
					])
					.then((results) => {
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
