/* eslint-disable consistent-return */
import config from 'config';
import sessionHandler from 'session-handler';
import authRoutes from '../routes/authRoutes';

class Auth {
    constructor(options = {}) {
        this.signInState = config.signinState;
        this.clientId = options.clientId;
        this.secret = options.clientSecret;
    }

    idpLogin() {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.className = 'hidden';
            iframe.onload = this.handleIframe.bind(this, iframe, (error, queryString) => {
                if (error) return reject(error);

                sessionHandler.set('HC_Id', this.getCodeFromString(queryString, 'auth_token'));
                this.authorize()
                    .then(res => resolve(res))
                    .catch(err => reject(err));
            });

            iframe.src = `${config.api}/login?` +
                `client_id=${encodeURIComponent(config.zkit.clientId)}&` +
                `reto=${encodeURIComponent(location.href)}`;

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

            iframe.src = `${config.api}/auth/auth?` +
                `client_id=${encodeURIComponent(this.clientId)}&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&` +
                'response_type=code&' +
                'scope=everything&' +
                `state=${this.signInState}#` +
                `${sessionHandler.get('HC_Id')}`;

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

    clientCredentialsLogin(userId) {
        const body = {
            client_id: this.clientId,
            grant_type: 'client_credentials',
            client_secret: this.secret,
            scope: `user:${userId}`,
        };
        return authRoutes.getAccessTokenFromCredentials(body)
            .then((res) => {
                sessionHandler.set('HC_Auth', res.access_token);
            });
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

    logout() {
        return authRoutes.revokeRefreshToken(sessionHandler.get('HC_Refresh'))
            .then(sessionHandler.logout.bind(sessionHandler));
    }
}


export default Auth;
