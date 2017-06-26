import capellaRoutes from './capellaRoutes';
import zkitRoutes from './zkitRoutes';

class ZeroKitAdapter {

	constructor() {
		this.queue = [];

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
			return zKitLoginObject.login(res.user.zerokit_id);
		})
		.then((zKitId) => {
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
			.then(function (res) {
				this.zKitId = res.zerokit_id;
				return zKitRegistrationObject.register(res.zerokit_id, res.session_id);
			}.bind(this))
			.then(function (res) {
				return capellaRoutes.validateRegistration(res.RegValidationVerifier, this.zKitId);
			}.bind(this))
			.then((res) => {
				console.log('registered new user');
			})
			.catch((error) => {
				console.log(error);
			});
	}

	encrypt(string) {
		let tresorId = '0000armv60emmos7sirglqoq';
		// TODO get the tresorId somehow
		zkit_sdk.encrypt(tresorId, string);		// eslint-disable-line camelcase
	}

	decrypt(encryptedData) {
		zkit_sdk.decrypt(encryptedData);		// eslint-disable-line camelcase
	}
}

export default ZeroKitAdapter;
