import userRoutes from '../routes/userRoutes';
import sessionHandler from '../lib/sessionHandler';

const UserData = {

	getUserId() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser ? hcUser.split(',')[0] : undefined;
	},

	getUserName() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser ? hcUser.split(',')[1] : undefined;
	},

	getUser() {
		const hcUser = sessionHandler.get('HC_User');

		return hcUser ? {
			user_name: hcUser.split(',')[1],
			user_id: hcUser.split(',')[0],
		} : 'User not logged in';
	},

	resolveUser() {
		return userRoutes.resolveUserId(this.getUserName())
			.then(res => res.user);
	},

};

export default UserData;
