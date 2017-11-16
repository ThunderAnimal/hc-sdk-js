import config from 'config';
import userRoutes from '../routes/userRoutes';
import sessionHandler from '../lib/sessionHandler';
import UserService from './UserService';
import loginForm, { tagIds as loginFormIds } from '../templates/loginForm';
import registrationForm, { tagIds as registrationFormIds } from '../templates/registrationForm';
import encryptionUtils from '../lib/EncryptionUtils';


class ZeroKitAdapter {
	constructor(options) {
		this.auth = options.authService;
		this.zeroKit = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = `${config.zkit.service_url}/static/v4/zkit-sdk.js`;
			script.querySelector('#zkit');
			script.addEventListener('load', () => {
				if (zkit_sdk) {
					zkit_sdk.setup(config.zkit.service_url, '');
					resolve(zkit_sdk);
				} else {
					reject(new Error('Setting up ZeroKit failed.'));
				}
			});
			document.getElementsByTagName('head')[0].appendChild(script);
		});
	}

	getLoginForm(parentElement, callback = () => {}) {
		parentElement.appendChild(loginForm);
		const zkitLoginNode = document.getElementById(loginFormIds.zkitLogin);
		while (zkitLoginNode.firstChild) {
			zkitLoginNode.removeChild(zkitLoginNode.firstChild);
		}
		const zKitLoginObject =
			this.zeroKit
				.then(zeroKit => zeroKit.getLoginIframe(zkitLoginNode));

		const submit = function (zKitLogin, cb, event) {
			event.preventDefault();
			this.login(zKitLogin, document.getElementById(loginFormIds.hcUserLogin).value, cb);
		};

		loginForm.onsubmit = submit.bind(this, zKitLoginObject, callback);
	}

	login(zKitLoginObject, hcUserAlias, callback) {
		let tresorId;
		let userId;
		let tek;
		userRoutes.resolveUserId(hcUserAlias)
			.then((res) => {
				const zKitId = res.user.zerokit_id;
				tresorId = res.user.tresor_id;
				userId = res.user.id;
				tek = res.user.tag_encryption_key;
				sessionHandler.set('HC_User', `${res.user.id},${hcUserAlias}`);

				return zKitLoginObject.then(loginObject => loginObject.login(zKitId));
			})
			.then(() => this.auth.idpLogin())
			.then(() => {
				if (!tresorId) {
					return this.createTresor();
				}
				return tresorId;
			})
			.then((res) => {
				if (!tek) {
					this.createTek(res);
				}
				callback(null, { user_id: userId, user_alias: hcUserAlias });
			})
			.catch(err => callback(err));
	}

	createTek(tresorId) {
		const tek = encryptionUtils.generateKey();
		return this.zeroKit.then(zeroKit => zeroKit.encrypt(tresorId, tek)
			.then(res => userRoutes.addTagEncryptionKey(UserService.getUserId(), res)
				.then(() => res)));
	}

	getRegistrationForm(parentElement, callback = () => {}) {
		parentElement.appendChild(registrationForm);
		const zkitRegisterNode = document.getElementById(registrationFormIds.zkitRegistration);
		while (zkitRegisterNode.firstChild) {
			zkitRegisterNode.removeChild(zkitRegisterNode.firstChild);
		}
		const zKitRegistrationObject =
			this.zeroKit.then(zeroKit => zeroKit.getRegistrationIframe(zkitRegisterNode));

		const submit = function (zKitRegistration, cb, event) {
			event.preventDefault();
			const userAlias = document.getElementById(registrationFormIds.hcUserRegister).value;
			return this.register(zKitRegistration, userAlias, cb);
		};

		registrationForm.onsubmit = submit.bind(this, zKitRegistrationObject, callback);
	}

	register(zKitRegistrationObject, hcUserAlias, callback) {
		let zKitId;
		return userRoutes.initRegistration(hcUserAlias)
			.then((res) => {
				zKitId = res.zerokit_id;
				return zKitRegistrationObject
					.then(registrationObject =>
						registrationObject.register(zKitId, res.session_id));
			})
			.then(res => userRoutes.validateRegistration(res.RegValidationVerifier, zKitId))
			.then(() => callback(null, { user_alias: hcUserAlias }))
			.catch(error => callback(error));
	}

	encrypt(plainText) {
		return this.getTresor()
			.then(tresorId => this.zeroKit.then(zeroKit => zeroKit.encrypt(tresorId, plainText)));
	}

	decrypt(cipherText) {
		return this.zeroKit.then(zeroKit => zeroKit.decrypt(cipherText));
	}

	encryptBlob(plainBlob) {
		return this.getTresor()
			.then(tresorId => this.zeroKit.then(zeroKit =>
				zeroKit.encryptBlob(tresorId, plainBlob)));
	}

	decryptBlob(cipherBlob) {
		return this.zeroKit.then(zeroKit => zeroKit.decryptBlob(cipherBlob));
	}

	getTresor() {
		return UserService.resolveUser()
			.then((user) => {
				let tresorId = user.tresor_id;
				if (!tresorId) {
					tresorId = this.createTresor();
				}
				return tresorId;
			});
	}

	createTresor() {
		return this.zeroKit.then(zeroKit => zeroKit.createTresor()
			.then(tresorId => userRoutes.addTresor(UserService.getUserId(), tresorId)
				.then(() => tresorId)));
	}

	logout() {
		return this.zeroKit.then(zerokit => zerokit.logout())
			.then((res) => {
				sessionHandler.logout();
				return res;
			});
	}
}

export default ZeroKitAdapter;
