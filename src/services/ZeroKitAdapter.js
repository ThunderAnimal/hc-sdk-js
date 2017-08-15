import userRoutes from '../routes/userRoutes';
import config from '../config';
import sessionHandler from '../lib/sessionHandler';
import UserService from './UserService';


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

		const loginForm = document.createElement('form');

		loginForm.innerHTML = `
			<input type="text" id="hcUsernameLogin" placeholder="Nutzername">
			<div id="zkitLogin"/></div>
			<button>Einloggen</button>
		`;

		parentElement.appendChild(loginForm);

		const zKitLoginObject = zkit_sdk.getLoginIframe(document.getElementById('zkitLogin'));

		const submit = function (zKitLogin, cb, event) {
			event.preventDefault();
			this.login(zKitLogin, document.getElementById('hcUsernameLogin').value, cb);
		};

		loginForm.onsubmit = submit.bind(this, zKitLoginObject, callback);
	}

	login(zKitLoginObject, hcUserName, callback) {
		let tresorId;
		let userId;
		userRoutes.resolveUserId(hcUserName)
			.then((res) => {
				const zKitId = res.user.zerokit_id;
				tresorId = res.user.tresor_id;
				userId = res.user.id;
				sessionHandler.set('HC_User', `${res.user.id},${hcUserName}`);

				return zKitLoginObject.login(zKitId);
			})
			.then(() => this.auth.idpLogin())
			.then(() => {
				if (!tresorId) {
					this.createTresor();
				}
				callback(null, { user_id: userId, user_name: hcUserName });
			})
			.catch(err => callback(err));
	}


	getRegistrationForm(parentElement, callback = () => {}) {
		if (typeof zkit_sdk === 'undefined') {
			this.queue.push({
				function: this.getRegistrationForm,
				parameters: [parentElement, callback],
			});
			return;
		}

		const registrationForm = document.createElement('form');

		registrationForm.innerHTML = `
			<input type="text" id="hcUsernameRegister" placeholder="Nutzername">
			<div id="zkitRegistration"></div>
			<button>Registrieren</button>
		`;

		parentElement.appendChild(registrationForm);

		const zKitRegistrationObject =
			zkit_sdk.getRegistrationIframe(document.getElementById('zkitRegistration'));

		const submit = function (zKitRegistration, cb, event) {
			event.preventDefault();
			const userName = document.getElementById('hcUsernameRegister').value;
			return this.register(zKitRegistration, userName, cb);
		};

		registrationForm.onsubmit = submit.bind(this, zKitRegistrationObject, callback);
	}

	register(zKitRegistrationObject, hcUserName, callback) {
		let zKitId;
		return userRoutes.initRegistration(hcUserName)
			.then((res) => {
				zKitId = res.zerokit_id;
				return zKitRegistrationObject.register(zKitId, res.session_id);
			})
			.then(res => userRoutes.validateRegistration(res.RegValidationVerifier, zKitId))
			.then(() => callback(null, { user_name: hcUserName }))
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
