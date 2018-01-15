import testVariables from './testVariables';

const userResources = {
    resolvedUser: {
        id: testVariables.userId,
        zeroKitId: testVariables.zeroKitId,
    },
    currentUser: {
        id: testVariables.userId,
        alias: testVariables.userAlias,
    },
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
            user_data: { encrypted_data: testVariables.encryptedUserData },
        },
    },
};

export default userResources;
