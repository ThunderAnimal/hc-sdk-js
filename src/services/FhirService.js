import documentRoutes from '../routes/documentRoutes';
import UserService from '../services/UserService';
import Tags from '../lib/Tags';
import encryptionUtils from '../lib/EncryptionUtils';
import helpers from '../lib/dateHelper';

class FHIRService {
	constructor(options = {}) {
		this.zeroKitAdapter = options.zeroKitAdapter;
	}

	uploadFhirRecord(JsonFHIR, tags = []) {
		tags = [...tags, ...(new Tags()).createTagsFromFHIR(JsonFHIR)];
		return this.uploadRecordWithTags(JsonFHIR, tags);
	}

	uploadRecordWithTags(doc, tags) {
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
					user_id: UserService.getUserId(),
					encrypted_body: results[0],
					encrypted_tags: results[1],
					date: helpers.formatDateYyyyMmDd(new Date()),
					version: 1,
				};
				return documentRoutes.uploadRecord(params);
			});
	}


	downloadFhirRecord(recordId) {
		return documentRoutes.downloadRecord(recordId)
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
}

export default FHIRService;
