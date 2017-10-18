import userRoutes from '../routes/userRoutes';
import sessionHandler from '../lib/sessionHandler';

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
}

export default new UserService();
