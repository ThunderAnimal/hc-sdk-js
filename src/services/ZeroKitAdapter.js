/* eslint-disable global-require */
import config from 'config';
import sessionHandler from 'session-handler';
import userRoutes from '../routes/userRoutes';
import userService from './userService';
import AuthService from './AuthService';
import { createLoginFormTemplate, tagIds as loginFormIds } from '../templates/loginForm';
import formStyles from '../templates/formStyles';
import { createRegistrationFormTemplate, tagIds as registrationFormIds } from '../templates/registrationForm';
import encryptionUtils from '../lib/EncryptionUtils';
import validationUtils from '../lib/validationUtils';
import ValidationError from '../lib/errors/ValidationError';
import stylesUtils from '../lib/stylesUtils';

let zkitNodeSDK;
if (NODE) {
    zkitNodeSDK = require('zerokit-node-client');
}

class ZeroKitAdapter {
    constructor(options) {
        this.authService = options.authService;
        this.zKitRegistrationObject = null;

        if (NODE) {
            this.zeroKit = zkitNodeSDK(config.zkit.service_url, config.zkit.version);
        } else {
            this.zeroKit = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `${config.zkit.service_url}/static/v4/zkit-sdk.js`;
                script.querySelector('#zkit');
                script.addEventListener('load', () => {
                    if (zkit_sdk) { // eslint-disable-line camelcase
                        zkit_sdk.setup(config.zkit.service_url, ''); // eslint-disable-line camelcase
                        resolve(zkit_sdk);
                    } else {
                        reject(new Error('Setting up ZeroKit failed.'));
                    }
                });
                document.getElementsByTagName('head')[0].appendChild(script);
            });
        }
    }

    loginNode(hcUserAlias, password) {
        return userService.resolveUser(hcUserAlias)
            .then(user => this.zeroKit.then(zeroKit => zeroKit.login(user.zeroKitId, password))
                .then(() => this.authService.clientCredentialsLogin(user.id))
                .then(() => {
                    sessionHandler.setItem('HC_User', `${user.id},${hcUserAlias}`);
                    return this.setupUser();
                })
                .then(() => ({ id: user.id, alias: hcUserAlias })));
    }

    login(zKitLoginObject, hcUserAlias) {
        let userId;
        return userService.resolveUser(hcUserAlias)
            .then((user) => {
                const { zeroKitId } = user;
                userId = user.id;
                sessionHandler.setItem('HC_User', `${userId},${hcUserAlias}`);

                return zKitLoginObject.then(loginObject => loginObject.login(zeroKitId));
            })
            .then(() => this.authService.idpLogin())
            // .then(() => this.setupUser())
            .then(() => ({ id: userId, alias: hcUserAlias }));
    }

    setupUser() {
        let tek;
        return userService.getInternalUser()
            .then((user) => {
                const tresorId = user.tresorId;
                tek = user.tek;

                if (!tresorId) {
                    return this.createTresor()
                        .then((createdTresorId) => {
                            userService.user.tresorId = createdTresorId;
                            return createdTresorId;
                        });
                }
                return tresorId;
            })
            .then((tresorId) => {
                if (!tek) {
                    this.createTek(tresorId)
                        .then((createdTek) => {
                            userService.user.tek = createdTek;
                        });
                }
            });
    }

    getLoginForm(parentElement) {
        return new Promise((resolve, reject) => {
            const loginFormTemplate = createLoginFormTemplate();
            parentElement.appendChild(loginFormTemplate);
            const zkitLoginNode = document.getElementById(loginFormIds.zkitLogin);
            while (zkitLoginNode.firstChild) {
                zkitLoginNode.removeChild(zkitLoginNode.firstChild);
            }
            const zKitLoginObject =
                this.zeroKit
                    .then((zeroKit) => {
                        stylesUtils.appendStyles(formStyles);
                        return zeroKit.getLoginIframe(zkitLoginNode);
                    });

            const submit = function (zKitLogin, event) {
                event.preventDefault();
                document.getElementById(loginFormIds.submitBtn).disabled = true;
                this.login(zKitLogin, document.getElementById(loginFormIds.hcUserLogin).value)
                    .then((response) => {
                        document.getElementById(loginFormIds.submitBtn).disabled = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        document.getElementById(loginFormIds.submitBtn).disabled = false;
                        reject(error);
                    });
            };

            loginFormTemplate.onsubmit = submit.bind(this, zKitLoginObject);
        });
    }

    createTek(tresorId) {
        const tek = encryptionUtils.generateKey();
        return this.zeroKit.then(zeroKit => zeroKit.encrypt(tresorId, tek)
            .then(res => userRoutes.addTagEncryptionKey(userService.getCurrentUser().id, res)
                .then(() => tek)));
    }

    getRegistrationForm(parentElement) {
        return new Promise((resolve, reject) => {
            const registrationFormTemplate = createRegistrationFormTemplate();
            parentElement.appendChild(registrationFormTemplate);
            const zkitRegisterNode = document.getElementById(registrationFormIds.zkitRegistration);
            while (zkitRegisterNode.firstChild) {
                zkitRegisterNode.removeChild(zkitRegisterNode.firstChild);
            }
            this.zKitRegistrationObject =
                this.zeroKit
                    .then((zeroKit) => {
                        stylesUtils.appendStyles(formStyles);
                        resolve();
                        return zeroKit.getRegistrationIframe(zkitRegisterNode);
                    })
                    .catch(reject);
        });
    }

    register(autoLogin = false) {
        const hcUserAlias = document.getElementById(registrationFormIds.hcUserRegister).value;
        if (!validationUtils.validateEmail(hcUserAlias)) {
            return Promise.reject(new ValidationError('Not a valid email'));
        }
        let zKitId;
        let sessionId;
        return userRoutes.initRegistration(hcUserAlias)
            .then((res) => {
                zKitId = res.zerokit_id;
                sessionId = res.session_id;
                return this.zKitRegistrationObject;
            })
            .then(registrationObject => registrationObject.register(zKitId, sessionId))
            .then(res => userRoutes.validateRegistration(res.RegValidationVerifier, zKitId))
            .then(() => (autoLogin ?
                this.login(this.zKitRegistrationObject, hcUserAlias) :
                { alias: hcUserAlias }));
    }

    encrypt(ownerId, plainText) {
        return userService.getInternalUser(ownerId)
            .then(owner => this.zeroKit.then(zeroKit =>
                zeroKit.encrypt(owner.tresorId, plainText)));
    }

    decrypt(cipherText) {
        return this.zeroKit.then(zeroKit => zeroKit.decrypt(cipherText));
    }

    encryptBlob(ownerId, plainBlob) {
        return userService.getInternalUser(ownerId)
            .then(owner => this.zeroKit.then(zeroKit =>
                zeroKit.encryptBlob(owner.tresorId, plainBlob)));
    }

    decryptBlob(cipherBlob) {
        return this.zeroKit.then(zeroKit => zeroKit.decryptBlob(cipherBlob));
    }

    createTresor() {
        return this.zeroKit.then(zeroKit => zeroKit.createTresor()
            .then(tresorId => userRoutes.addTresor(userService.getCurrentUser().id, tresorId)
                .then(() => tresorId)));
    }

    grantPermission(granteeAlias) {
        let grantee;
        let owner;

        return Promise.all(
            [
                userService.resolveUser(granteeAlias),
                userService.getInternalUser(),
            ],
        )
            .then((result) => {
                grantee = result[0];
                owner = result[1];
                return this.zeroKit.then(zeroKit =>
                    zeroKit.shareTresor(owner.tresorId, grantee.zeroKitId));
            })
            .then((operationId) => {
                userRoutes.verifyShareAndGrantPermission(owner.id, grantee.id, operationId);
            })
            .catch((err) => {
                if (err.message === 'AlreadyMember') return;
                throw err;
            });
    }

    logout() {
        return Promise.all([
            this.zeroKit.then(zerokit => zerokit.logout()),
            AuthService.logout(),
        ])
            .then(() => { userService.resetUser(); });
    }
}

export default ZeroKitAdapter;
