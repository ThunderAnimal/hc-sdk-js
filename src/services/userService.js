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
            throw new SetUpError(NOT_SETUP);
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

};

export default userService;
