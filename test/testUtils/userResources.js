import testVariables from './testVariables';

const userResources = {
	internalUser: {
		id: testVariables.userId,
		alias: testVariables.userAlias,
		zeroKitId: testVariables.zeroKitId,
		tresorId: testVariables.tresorId,
		state: testVariables.state,
		tek: testVariables.tek,
		userData: testVariables.userData,
	},
	userDetails: {
		user: {
			id: testVariables.userId,
			email: testVariables.userAlias,
			zerokit_id: testVariables.zeroKitId,
			tresor_id: testVariables.tresorId,
			state: testVariables.state,
			tag_encryption_key: testVariables.encryptedTek,
			user_data: { encryptedData: testVariables.encryptedUserData },
		},
	},
};

export default userResources;
