import sessionHandler from 'session-handler';
import userRoutes from '../routes/userRoutes';
import LoginError, { NOT_LOGGED_IN } from '../lib/errors/LoginError';
import ValidationError, {
    MISSING_PARAMETERS,
    INVALID_PARAMETERS,
} from '../lib/errors/ValidationError';

const userService = {
    user: null,

    setZeroKitAdapter(adapter) {
        this.zeroKitAdapter = adapter;
    },

    resetUser() {
        this.user = null;
    },

    resolveUser(alias) {
        return userRoutes.resolveUserId(alias)
            .then(user => ({ id: user.uid, zeroKitId: user.zerokit_id }));
    },

    getUserIdForAlias(alias) {
        return this.resolveUser(alias).then(user => user.id);
    },

    getCurrentUser() {
        const currentUser = sessionHandler.getItem('HC_User');

        return currentUser && sessionHandler.getItem('HC_Auth') ? {
            alias: currentUser.split(',')[1],
            id: currentUser.split(',')[0],
        } : undefined;
    },

    isCurrentUser(userId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.id !== userId) return false;
        return true;
    },

    getInternalUser(userId, partial = false) {
        return new Promise((resolve, reject) => {
            if (!this.getCurrentUser()) return reject(new LoginError(NOT_LOGGED_IN));

            const id = userId || this.getCurrentUser().id;
            if (this.isCurrentUser(id) && this.user) return resolve(this.user);

            const user = {};

            return userRoutes.getUserDetails(id)
                .then((userDetails) => {
                    user.id = userDetails.user.id;
                    user.alias = userDetails.user.email;
                    user.zeroKitId = userDetails.user.zerokit_id;
                    user.tresorId = userDetails.user.tresor_id;
                    user.state = userDetails.user.state;

                    if (partial) return resolve(user);

                    const userDataPromise =
                        userDetails.user.user_data && userDetails.user.user_data.encrypted_data ?
                            this.zeroKitAdapter.decrypt(userDetails.user.user_data.encrypted_data) :
                            Promise.resolve('{}');
                    const tekPromise = userDetails.user.tag_encryption_key ?
                        this.zeroKitAdapter.decrypt(userDetails.user.tag_encryption_key) :
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

            if (!(currentUser && currentUser.id)) {
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

            this.getInternalUser(currentUser.id, true)
                .then(user => Object.assign({}, user.userData, params))
                .then(JSON.stringify)
                .then(data => this.zeroKitAdapter.encrypt(currentUser.id, data))
                .then(encryptedUserDetails =>
                    userRoutes.updateUser(currentUser.id, { encrypted_data: encryptedUserDetails }))
                .then(resolve)
                .catch(reject);
        });
    },

    getGrantedPermissions(granteeId) {
        const owner = this.getCurrentUser();
        if (!(owner && owner.id)) {
            return Promise.reject(new LoginError(NOT_LOGGED_IN));
        }
        return userRoutes.getGrantedPermissions(owner.id, granteeId)
            .then(permissions => permissions.map(permission => ({
                granteeId: permission.grantee_id,
            })));
    },
};

export default userService;
