import userRoutes from '../routes/userRoutes';
import SetUpError, { NOT_SETUP } from '../lib/errors/SetupError';
// import crypto from '../lib/crypto';
import ValidationError, {
    MISSING_PARAMETERS,
    INVALID_PARAMETERS,
} from '../lib/errors/ValidationError';

const userService = {
    currentUser: null,
    user: null,

    resetUser() {
        this.user = null;
        this.currentUser = null;
    },

    resolveUser(alias) {
        return userRoutes.resolveUserId(alias)
            .then(user => ({ id: user.uid }));
    },

    getUserIdForAlias(alias) {
        return this.resolveUser(alias).then(user => user.id);
    },

    getCurrentUser() {
        // TODO throw error
        // if (!this.currentUser) throw new SetUpError(NOT_SETUP);
        if (!this.currentUser) console.warn(new SetUpError(NOT_SETUP));


        return this.currentUser;
    },

    isCurrentUser(userId) {
        return userId === this.getCurrentUser();
    },

    getInternalUser(userId, partial = false) {
        return new Promise((resolve, reject) => {
            const id = userId || this.getCurrentUser();
            if (this.isCurrentUser(id) && this.user) {
                return resolve(this.user);
            }

            const user = {};

            return userRoutes.getUserDetails(id)
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

                    if (this.isCurrentUser(id)) this.user = user;
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
