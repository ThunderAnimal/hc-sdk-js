import userRoutes from '../routes/userRoutes';
import crypto from '../lib/crypto';
import SetUpError, { NOT_SETUP } from '../lib/errors/SetupError';

const userService = {
    currentUserId: null,
    users: {},
    privateKey: null,

    resetUser() {
        this.users = {};
        this.currentUserId = null;
        this.privateKey = null;
    },

    setPrivateKey(base64privateKey) {
        this.privateKey = JSON.parse(atob(base64privateKey));
    },

    getCurrentUserId() {
        return this.currentUserId;
    },

    isCurrentUser(userId) {
        return userId === this.currentUserId;
    },

    getUser(userId) {
        const uId = userId || this.currentUserId;
        return this.users[uId] ? Promise.resolve(this.users[uId]) : this.pullUser(userId);
    },

    /**
     *  @param {String} userId - userId of the user whos data is requested.
     *                           Loggedin user by default.
     *  @returns {Promise} Resolves to a userObject that contains userId,
     *                     commonKey and tagEncryptionKey
     */
    pullUser(userId) {
        if (!this.privateKey) {
            return Promise.reject(new SetUpError(NOT_SETUP));
        }
        let commonKey;
        return userRoutes.fetchUserInfo(userId)
            .then(res => crypto.asymDecryptString(this.privateKey, res.common_key)
                .then(JSON.parse)
                .then((key) => {
                    commonKey = key;
                    return crypto.symDecryptObject(commonKey, res.tag_encryption_key);
                })
                .then((tek) => {
                    if (!userId) {
                        this.currentUserId = res.sub;
                        userId = this.currentUserId;
                    }

                    this.users[userId] = {
                        id: userId,
                        commonKey,
                        tek,
                    };
                    return this.users[userId];
                }),
            );
    },

    /**
     *  @returns {Promise} Resolves to an array of received permissions.
     *      A permission contains:
     *          - permissionId: the id of the permission
     *          - appId: the id of the user-client combination that is allowed to access data
     *          - owner: the id of the user that owns the data
     *          - grantee: the id of the user that received the permission
     *          - granteePublicKey: the publicKey of the grantee (base64 encoded)
     *          - commonKey: the common key of the owner, encrypted with the grantee's
     *              public key (base64 encoded)
     *          - scope: the scope of the permission (array of strings)
     *
     * TODO: decide on which data should be exposed
     */
    getReceivedPermissions() {
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) {
            return Promise.reject(new SetUpError(NOT_SETUP));
        }
        return userRoutes.getReceivedPermissions(currentUserId)
            .then(permissions =>
                permissions.map(({
                    app_id: appId,
                    common_key: commonKey,
                    grantee,
                    grantee_public_key: granteePublicKey,
                    id,
                    owner,
                    scope,
                }) => ({
                    appId, commonKey, grantee, granteePublicKey, id, owner, scope: scope.split(' '),
                })));
    },
};

export default userService;
