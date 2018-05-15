import testVariables from './testVariables';
import encryptionResources from './encryptionResources';

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
    fetchUserInfo: {
        sub: testVariables.userId,
        common_key: encryptionResources.encryptedCommonKey,
        tag_encryption_key: encryptionResources.encryptedTagEncryptionKey,
        app_id: testVariables.appId,
    },
    userDetails: {
        user: {
            id: testVariables.userId,
            email: testVariables.userAlias,
            zerokit_id: testVariables.zeroKitId,
            tresor_id: testVariables.tresorId,
            state: testVariables.state,
            // TODO encryptedUserData, when encryption works
            tag_encryption_key: testVariables.tek,
            // TODO encryptedUserData, when encryption works
            user_data: { encrypted_data: JSON.stringify(testVariables.userData) },
        },
    },
    cryptoUser: {
        id: testVariables.userId,
        commonKey: encryptionResources.commonKey,
        tek: encryptionResources.symHCKey,
    },
    scopeArray: ['rec:r', 'rec:w', 'attachment:r', 'attachment:w', 'user:r', 'user:w', 'user:q'],
};

export default userResources;
