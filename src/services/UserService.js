import userRoutes from '../routes/userRoutes';
import sessionHandler from '../lib/sessionHandler';
import LoginError, { NOT_LOGGED_IN } from '../lib/errors/LoginError';
import ValidationError, {
	MISSING_PARAMETERS,
	INVALID_PARAMETERS,
} from '../lib/errors/ValidationError';

class UserService {
	constructor() {
		this.user = null;
	}
	setZeroKitAdapter(adapter) {
		this.zeroKitAdapter = adapter;
	}
	getUserId() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser ? hcUser.split(',')[0] : undefined;
	}

	getUserAlias() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser ? hcUser.split(',')[1] : undefined;
	}

	getUserIdAndAlias() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser && sessionHandler.get('HC_Auth') ? {
			user_alias: hcUser.split(',')[1],
			user_id: hcUser.split(',')[0],
		} : undefined;
	}

	getUser() {
		return new Promise((resolve, reject) => {
			const user = {
				id: '',
				email: '',
				user_data: {},
				state: '',
			};
			this.resolveUser()
				.then((resolvedUser) => {
					user.email = resolvedUser.email;
					user.id = resolvedUser.id;
					user.state = resolvedUser.state;

					if (!resolvedUser.user_data || !resolvedUser.user_data.encrypted_data) {
						resolve(user);
						return null;
					}

					return resolvedUser.user_data.encrypted_data;
				})
				.then(encryptedUserData => this.zeroKitAdapter.decrypt(encryptedUserData))
				.then(JSON.parse)
				.then((userData) => {
					user.user_data = userData;
					resolve(user);
				})
				.catch(reject);
		});
	}

	resolveUser() {
		if (this.user) {
			return new Promise((resolve) => {
				resolve(this.user);
			});
		}

		const userId = this.getUserId();
		if (!userId) {
			return Promise.reject(new LoginError(NOT_LOGGED_IN));
		}

		return userRoutes.getUserDetails(userId)
			.then((res) => {
				this.user = res.user;
				return this.user;
			});
	}

	resolveUserByAlias(alias) {
		return userRoutes.resolveUserId(alias)
			.then(res => res.user);
	}

	updateUser(params) {
		return new Promise((resolve, reject) => {
			const userId = this.getUserId();

			if (!userId) {
				reject(new LoginError(NOT_LOGGED_IN));
				return;
			}

			if (!params) {
				reject(new ValidationError(MISSING_PARAMETERS));
				return;
			}

			if (Object.keys(params).length === 0) {
				reject(new ValidationError(`${INVALID_PARAMETERS}: object is empty`));
				return;
			}

			if (typeof params !== 'object') {
				reject(new ValidationError(`${INVALID_PARAMETERS}: parameter is not an object`));
				return;
			}

			this.getUser()
				.then((res) => {
					if (!res.user_data || !res.user_data.encrypted_data) {
						return '{}';
					}
					return this.zeroKitAdapter.decrypt(res.user_data.encrypted_data);
				})
				.then(userDetails => Object.assign({}, userDetails, params))
				.then(JSON.stringify)
				.then(data => this.zeroKitAdapter.encrypt(data))
				.then(encryptedUserDetails =>
					userRoutes.updateUser(userId, { encrypted_data: encryptedUserDetails }))
				.then(resolve)
				.catch(reject);
		});
	}
}

export default new UserService();
