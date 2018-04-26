import userRoutes from '../routes/userRoutes';
import crypto from '../lib/crypto';
import SetUpError, { NOT_SETUP } from '../lib/errors/SetupError';
import ValidationError, {
    MISSING_PARAMETERS,
    INVALID_PARAMETERS,
} from '../lib/errors/ValidationError';

const userService = {
    currentUserId: null,
    user: null,
    privateKey: null,

    resetUser() {
        this.user = null;
        this.currentUserId = null;
        this.privateKey = null;
    },

    resolveUser(alias) {
        return userRoutes.resolveUserId(alias)
            .then(user => ({ id: user.uid }));
    },

    getUserIdForAlias(alias) {
        return this.resolveUser(alias).then(user => user.id);
    },

    setPrivateKey(base64privateKey) {
        this.privateKey = JSON.parse(atob(base64privateKey));
    },

    getCurrentUser() {
        return this.user ? Promise.resolve(this.user) : this.pullCurrentUser();
    },

    isCurrentUser(userId) {
        return userId === this.currentUserId;
    },

    pullCurrentUser() {
        if (!this.privateKey) {
            throw new SetUpError(NOT_SETUP);
        }
        let commonKey;
        return userRoutes.fetchUserInfo()
            .then(res => crypto.asymDecryptString(this.privateKey, res.common_key)
                .then(JSON.parse)
                .then((key) => {
                    commonKey = key;
                    return crypto.symDecryptObject(commonKey, res.tag_encryption_key);
                })
                .then((tek) => {
                    this.currentUserId = res.sub;

                    this.user = {
                        id: res.sub,
                        commonKey,
                        tek,
                    };
                    return this.user;
                }),
            );
    },

    getInternalUser(userId, partial = false) {
        const hasUserIds = userId && this.currentUserId;
        if (!(hasUserIds) || this.isCurrentUser(userId)) {
            return this.getCurrentUser();
        }

        // TODO handle in case of other user once api is in place
        return new Promise((resolve, reject) => {
            const user = {};
            return userRoutes.getUserDetails(userId)
                .then((userDetails) => {
                    user.id = userDetails.user.id;
                    user.alias = userDetails.user.email;
                    user.state = userDetails.user.state;

                    if (partial) return resolve(user);

                    const userDataPromise =
                        userDetails.user.user_data && userDetails.user.user_data.encrypted_data ?
                            // TODO proper decryption
                            userDetails.user.user_data.encrypted_data :
                            Promise.resolve('{}');
                    const tekPromise = userDetails.user.tag_encryption_key ?
                    // TODO decryption
                        userDetails.user.tag_encryption_key :
                        Promise.resolve(undefined);
                    return Promise.all([userDataPromise, tekPromise]);
                })
                .then((decryptedResults) => {
                    user.userData = JSON.parse(decryptedResults[0]);
                    user.tek = decryptedResults[1];

                    return resolve(user);
                })
                .catch(reject);
        });
    },

    getUser(userId) {
        return this.getInternalUser(userId)
            .then(userDetails => ({
                id: userDetails.id,
                alias: userDetails.alias,
                state: userDetails.state,
                userData: userDetails.userData,
            }));
    },

    updateUser(params) {
        return new Promise((resolve, reject) => {
            const currentUser = this.getCurrentUser();

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

            this.getInternalUser(currentUser.id, true)
                .then(user => Object.assign({}, user.userData, params))
                .then(JSON.stringify)
                // TODO encrypt
                .then(encryptedUserDetails =>
                    userRoutes.updateUser(currentUser.id, { encrypted_data: encryptedUserDetails }))
                .then(resolve)
                .catch(reject);
        });
    },
};

export default userService;
