import config from '../config';
import siriusRoutes from '../routes/siriusRoutes';
import SessionHandler from './SessionHandler';

class Auth {

	constructor(options) {
		this.clientId = options.clientId;
		this.userId = options.userId;
		if (window.location.search) {  // replace search with hash when sirius starts sending hash
			this.authenticate(this.getCodeFromHash());
		}
	}

	signIn() {
		let oauth2Endpoint = `${config.api.sirius}/v1/oauth2/authorize`;

        // Create <form> element to submit parameters to OAuth 2.0 endpoint.
		let form = document.createElement('form');
		form.setAttribute('method', 'GET'); // Send as a GET request.
		form.setAttribute('action', oauth2Endpoint);
        // Parameters to pass to OAuth 2.0 endpoint.
		let params = {
			client_id: this.clientId,
			redirect_uri: window.location.origin + window.location.pathname,
			response_type: 'code',
			scope: 'everything',
			user_id: SessionHandler.get('HC_User'),
			state: 'xyz' };

        // Add form parameters as hidden input values.
		Object.keys(params).forEach((p) => {
			let input = document.createElement('input');
			input.setAttribute('type', 'hidden');
			input.setAttribute('name', p);
			input.setAttribute('value', params[p]);

			form.appendChild(input);
		});

        // Add form to page and submit it to open the OAuth 2.0 endpoint.
		document.body.appendChild(form);
		form.submit();
	}

	getCodeFromHash() {
		return window.location.search.substr(window.location.search.indexOf('code=')) // replace search with hash when sirius starts sending hash
           .split('&')[0]
           .split('=')[1];
	}

	authenticate(code) {
		let params = { client_id: this.clientId,
			redirect_uri: window.location.origin + window.location.pathname,
			grant_type: 'authorization_code',
			code,
		};


		siriusRoutes.getAccessTokenFromCode(params).then((res) => {
			SessionHandler.set('HC_Auth', res.access_token);
			SessionHandler.set('HC_Refresh', res.refresh_token);
		});
	}

	refresh() {
		let params = {
			client_id: this.clientId,
			refresh_token: SessionHandler.get('HC_Refresh'),
			grant_type: 'refresh_token',
		};

		siriusRoutes.getRefreshTokenFromCode(params).then((res) => {
			SessionHandler.set('HC_Auth', res.access_token);
			SessionHandler.set('HC_Refresh', res.refresh_token);
		});
	}


}

export default Auth;
