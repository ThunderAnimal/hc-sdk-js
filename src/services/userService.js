import userRoutes from '../routes/userRoutes';
import crypto from '../lib/crypto';
import taggingUtils from '../lib/taggingUtils';
import SetUpError, { NOT_SETUP } from '../lib/errors/SetupError';

const userService = {
    currentUserId: null,
    currentAppId: null,
    users: {},
    privateKey: null,

    resetUser() {
        this.users = {};
        this.currentUserId = null;
        this.currentAppId = null;
        this.privateKey = null;
    },

    /**
     * Sets the loggedin user's privateKey
     * @param {String} base64PrivateKey - a privateKey of the loggedin user as a base64 string
    */
    setPrivateKey(base64PrivateKey) {
        this.privateKey = JSON.parse(atob(base64PrivateKey));
    },

    getCurrentUserId() {
        return this.currentUserId;
    },

    getCurrentAppId() {
        return this.currentAppId;
    },

    isCurrentUser(userId) {
        return userId === this.currentUserId;
    },

    /**
     *
     *  @param {String} userId - userId of the user whos data is requested.
     *      Loggedin user by default(even if this.currentUserId is not set yet).
     *  @returns {Promise} Resolves to a userObject that contains userId,
     *      commonKey and tagEncryptionKey
     */
    getUser(userId = this.currentUserId) {
        return this.users[userId] ? Promise.resolve(this.users[userId]) : this.pullUser(userId);
    },

    /**
     *  @param {String} userId - userId of the user whos data is requested.
     *      Loggedin user by default.
     *  @returns {Promise} Resolves to a userObject that contains userId,
     *      commonKey and tagEncryptionKey
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
                        this.currentAppId = res.app_id;
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

    /**
     * @param {String} appId - the id of the user-client tuple the permission shall be granted to
     * @param {Array} annotations - the annotations that shall be shared.
     * @returns {Promise}
     */
    grantPermission(appId, annotations = []) {
        const scope = ['rec:r', 'rec:w', 'attachment:r', 'attachment:w', 'user:r', 'user:w', 'user:q'];
        let ownerId;
        let granteeId;

        return Promise.all([
            userRoutes.getCAPs(appId),
            this.getUser(),
        ])
            .then(([CAPs, user]) => {
                const CAP = CAPs[0];
                ownerId = user.id;
                granteeId = CAP.owner;
                const publicKey = JSON.parse(atob(CAP.grantee_public_key));
                const commonKeyString = JSON.stringify(user.commonKey);
                const commonKeyPromise = crypto.asymEncryptString(publicKey, commonKeyString);

                const annotationsPromise = Promise.all(annotations.map(annotation =>
                    crypto.symEncryptString(user.tek, taggingUtils.buildTag('custom', annotation))));

                return Promise.all([commonKeyPromise, annotationsPromise]);
            })
            .then(([commonKey, cipherAnnotations]) => {
                const annotationScope = cipherAnnotations.map(annotation => `tag:${annotation}`);
                return userRoutes.grantPermission(
                    ownerId,
                    granteeId,
                    appId,
                    commonKey,
                    [...scope, ...annotationScope]);
            });
    },

};

export default userService;
