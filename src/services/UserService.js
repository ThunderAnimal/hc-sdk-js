import userRoutes from '../routes/userRoutes';
import sessionHandler from '../lib/sessionHandler';
import LoginError, { NOT_LOGGED_IN } from '../lib/Error/LoginError';
import ValidationError, {
	MISSING_PARAMETERS,
	INVALID_PARAMETERS,
} from '../lib/Error/ValidationError';

class UserService {
	constructor() {
		this.user = null;
	}
	getUserId() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser ? hcUser.split(',')[0] : undefined;
	}

	getUserAlias() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser ? hcUser.split(',')[1] : undefined;
	}

	getUser() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser && sessionHandler.get('HC_Auth') ? {
			user_alias: hcUser.split(',')[1],
			user_id: hcUser.split(',')[0],
		} : undefined;
	}

	resolveUser() {
		if (this.user) {
			return new Promise((resolve) => {
				resolve(this.user);
			});
		}
		return userRoutes.resolveUserId(this.getUserAlias())
			.then((res) => {
				this.user = res.user;
				return this.user;
			});
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

			userRoutes.updateUser(userId, params)
				.then(resolve)
				.catch(reject);
		});
	}
}

export default new UserService();
