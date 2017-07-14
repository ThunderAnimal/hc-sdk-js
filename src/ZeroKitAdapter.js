import capellaRoutes from './routes/capellaRoutes';
import sessionHandler from './services/SessionHandler';
import User from './models/User';
import Auth from './services/Auth';

class ZeroKitAdapter {

	constructor(options) {
		this.queue = [];
		this.auth = new Auth(options);

		let script = document.createElement('script');
		script.src = 'https://lcr5rln4b6.api.tresorit.io/static/v4/zkit-sdk.js';
		script.querySelector('#zkit');
		script.addEventListener('load', () => {
			zkit_sdk.setup('https://lcr5rln4b6.api.tresorit.io', '');
			this.handleQueue();
		});
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	handleQueue() {
		this.queue.forEach((functionCall) => {
			functionCall.function.apply(this, functionCall.parameters);
		});
	}

	getLoginFrame(parentElement) {
		if (typeof zkit_sdk === 'undefined') {		// eslint-disable-line camelcase
			this.queue.push({
				function: this.getLoginFrame,
				parameters: [parentElement],
			});
			return;
		}

		let loginForm = document.createElement('form');

		loginForm.innerHTML = `
			<input type="text" id="hcUsername" placeholder="Nutzername">
			<div id="zkitLogin"/></div>
			<button>Einloggen</button>
		`;

		parentElement.appendChild(loginForm);

		let zKitLoginObject = zkit_sdk.getLoginIframe(document.getElementById('zkitLogin'));

		let submit = function (zKitLogin, event) {
			event.preventDefault();
			this.login(zKitLogin, document.getElementById('hcUsername').value);
		};

		loginForm.onsubmit = submit.bind(this, zKitLoginObject);
	}

	login(zKitLoginObject, hcUserName) {
		capellaRoutes.resolveUserId(hcUserName).then((res) => {
			sessionHandler.set('HC_User', res.user.id);
			return zKitLoginObject.login(res.user.zerokit_id);
		}).then((zKitId) => {
			this.auth.signIn();
			console.log(`logged in as ${zKitId}`);
		}).catch((error) => {
			console.log(error);
		});
	}

	getRegistrationFrame(parentElement) {
		if (typeof zkit_sdk === 'undefined') {		// eslint-disable-line camelcase
			this.queue.push({
				function: this.getRegistrationFrame,
				parameters: [parentElement],
			});
			return;
		}

		let registrationForm = document.createElement('form');

		registrationForm.innerHTML = `
			<input type="text" id="hcUsername" placeholder="Nutzername">
			<div id="zkitRegistration"></div>
			<button>Registrieren</button>
		`;

		parentElement.appendChild(registrationForm);

		let zKitRegistrationObject = zkit_sdk.getRegistrationIframe(document.getElementById('zkitRegistration'));		// eslint-disable-line camelcase

		let submit = function (zKitRegistration, event) {
			event.preventDefault();
			this.register(zKitRegistration, document.getElementById('hcUsername').value);
		};

		registrationForm.onsubmit = submit.bind(this, zKitRegistrationObject);
	}

	register(zKitRegistrationObject, hcUserName) {
		capellaRoutes.initRegistration(hcUserName)
			.then((res) => {
				this.zKitId = res.zerokit_id;
				return zKitRegistrationObject.register(res.zerokit_id, res.session_id);
			})
			.then(res => capellaRoutes.validateRegistration(res.RegValidationVerifier, this.zKitId))
			.then(res => capellaRoutes.resolveUserId(hcUserName))
			.then((res) => {
				sessionHandler.set('HC_User', res.user.id);
				this.auth.signIn();
				console.log('registered new user');
			})
			.catch((error) => {
				console.log(error);
			});
	}

	encrypt(string) {
		let tresorId = '';
		// TODO get the tresorId somehow
		return zkit_sdk.encrypt(tresorId, string);		// eslint-disable-line camelcase
	}

	decrypt(encryptedData) {
		zkit_sdk.decrypt(encryptedData);		// eslint-disable-line camelcase
	}
}

export default ZeroKitAdapter;
