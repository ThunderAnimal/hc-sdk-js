import userRoutes from '../routes/userRoutes';
import config from '../config';
import sessionHandler from '../lib/sessionHandler';
import UserService from './UserService';
import loginForm, { tagIds as loginFormIds } from '../templates/loginForm';
import registrationForm, { tagIds as registrationFormIds } from '../templates/registrationForm';
import encryptionUtils from '../lib/EncryptionUtils';


class ZeroKitAdapter {
	constructor(options) {
		this.queue = [];
		this.auth = options.authService;

		const script = document.createElement('script');
		script.src = `${config.zkit.service_url}/static/v4/zkit-sdk.js`;
		script.querySelector('#zkit');
		script.addEventListener('load', () => {
			zkit_sdk.setup(config.zkit.service_url, '');
			this.handleQueue();
		});
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	handleQueue() {
		this.queue.forEach((functionCall) => {
			functionCall.function.apply(this, functionCall.parameters);
		});
	}

	getLoginForm(parentElement, callback = () => {}) {
		if (typeof zkit_sdk === 'undefined') {
			this.queue.push({
				function: this.getLoginForm,
				parameters: [parentElement, callback],
			});
			return;
		}

		parentElement.appendChild(loginForm);
		const zKitLoginObject =
			zkit_sdk.getLoginIframe(document.getElementById(loginFormIds.zkitLogin));

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

				return zKitLoginObject.login(zKitId);
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
		return zkit_sdk.encrypt(tresorId, tek)
			.then(res => userRoutes.addTagEncryptionKey(UserService.getUserId(), res)
				.then(() => res));
	}

	getRegistrationForm(parentElement, callback = () => {}) {
		if (typeof zkit_sdk === 'undefined') {
			this.queue.push({
				function: this.getRegistrationForm,
				parameters: [parentElement, callback],
			});
			return;
		}

		parentElement.appendChild(registrationForm);
		const zKitRegistrationObject =
			zkit_sdk.getRegistrationIframe(
				document.getElementById(registrationFormIds.zkitRegistration));

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
				return zKitRegistrationObject.register(zKitId, res.session_id);
			})
			.then(res => userRoutes.validateRegistration(res.RegValidationVerifier, zKitId))
			.then(() => callback(null, { user_alias: hcUserAlias }))
			.catch(error => callback(error));
	}

	encrypt(string) {
		return this.getTresor()
			.then(res => zkit_sdk.encrypt(res, string));
	}

	decrypt(encryptedData) {
		return zkit_sdk.decrypt(encryptedData);
	}

	getTresor() {
		return UserService.resolveUser()
			.then((res) => {
				let tresorId = res.tresor_id;
				if (!tresorId) {
					tresorId = this.createTresor();
				}
				return tresorId;
			});
	}

	createTresor() {
		return zkit_sdk.createTresor()
			.then(tresorId => userRoutes.addTresor(UserService.getUserId(), tresorId)
				.then(() => tresorId));
	}
}

export default ZeroKitAdapter;
