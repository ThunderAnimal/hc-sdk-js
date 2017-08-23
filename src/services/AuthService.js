/* eslint-disable consistent-return */
import config from '../config';
import sessionHandler from '../lib/sessionHandler';
import authRoutes from '../routes/authRoutes';
import UserService from './UserService';

class Auth {
	constructor(options = {}) {
		this.signInState = config.signinState;
		this.clientId = options.clientId;
	}

	idpLogin() {
		return new Promise((resolve, reject) => {
			const iframe = document.createElement('iframe');
			iframe.className = 'hidden';
			iframe.onload = this.handleIframe.bind(this, iframe, (error, queryString) => {
				if (error) return reject(error);

				sessionHandler.set('HC_Id', this.getCodeFromString(queryString, 'token'));
				this.authorize()
					.then(res => resolve(res))
					.catch(err => reject(err));
			});

			iframe.src = `${config.api.auth}/login?
				clientId=${encodeURIComponent(config.zkit.clientId)}&
				reto=${encodeURIComponent(location.href)}`;

			document.body.appendChild(iframe);
		});
	}

	authorize() {
		return new Promise((resolve, reject) => {
			const iframe = document.createElement('iframe');
			iframe.style.display = 'none';
			iframe.onload = this.handleIframe.bind(this, iframe, (error, queryString) => {
				if (error) return reject(error);

				this.exchangeTokenAndLogin(this.getCodeAndStateFromHash(queryString))
					.then(res => resolve(res))
					.catch(err => reject(err));
			});

			iframe.src = String.raw`${config.api.auth}/auth/authorize?
				client_id=${encodeURIComponent(this.clientId)}&
				redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&
				response_type=code&
				scope=everything&
				user_id=${UserService.getUserId()}&
				state=${this.signInState}`;

			document.body.appendChild(iframe);
		});
	}

	handleIframe(iframe, callback) {
		let iframeLocation;
		try {
			iframeLocation = iframe.contentWindow.location;
			if (iframeLocation.origin !== window.location.origin) return false;
		} catch (err) {
			return false;
		}
		if (iframeLocation.pathname === location.pathname) {
			const queryString = iframeLocation.search || iframeLocation.hash;

			document.body.removeChild(iframe);
			if (queryString && queryString.indexOf('error') !== -1) {
				callback(this.getCodeFromString(queryString, 'error'));
				return;
			}
			callback(null, queryString);
		}
	}

	getCodeAndStateFromHash(string) {
		const code = this.getCodeFromString(string, 'code');
		const state = this.getCodeFromString(string, 'state');

		return { code, state };
	}

	getCodeFromString(queryString, key) {
		return queryString
			.substr(queryString.indexOf(`${key}=`))
			.split('&')[0]
			.split('=')[1];
	}

	exchangeTokenAndLogin(options) {
		return new Promise((resolve, reject) => {
			if (options.state === this.signInState) {
				const params = {
					client_id: this.clientId,
					redirect_uri: window.location.origin + window.location.pathname,
					grant_type: 'authorization_code',
					code: options.code,
				};

				authRoutes.getAccessTokenFromCode(params)
					.then((res) => {
						sessionHandler.set('HC_Auth', res.access_token);
						sessionHandler.set('HC_Refresh', res.refresh_token);
						resolve(res);
					})
					.catch(err => reject(err));
			}
		});
	}
}


export default Auth;
