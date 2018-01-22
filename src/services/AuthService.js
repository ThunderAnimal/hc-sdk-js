/* eslint-disable consistent-return */
import config from 'config';
import sessionHandler from 'session-handler';
import authRoutes from '../routes/authRoutes';

const getCodeFromString = (queryString, key) => queryString
    .substr(queryString.indexOf(`${key}=`))
    .split('&')[0]
    .split('=')[1];

const getCodeAndStateFromHash = (string) => {
    const code = getCodeFromString(string, 'code');
    const state = getCodeFromString(string, 'state');

    return { code, state };
};

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
            iframe.onload = Auth.handleIframe.bind(this, iframe, (error, queryString) => {
                if (error) return reject(error);

                sessionHandler.setItem('HC_Id', getCodeFromString(queryString, 'auth_token'));
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
            iframe.onload = Auth.handleIframe.bind(this, iframe, (error, queryString) => {
                if (error) return reject(error);

                this.exchangeTokenAndLogin(getCodeAndStateFromHash(queryString))
                    .then(res => resolve(res))
                    .catch(err => reject(err));
            });

            iframe.src = `${config.api}/auth/auth?` +
                `client_id=${encodeURIComponent(this.clientId)}&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&` +
                'response_type=code&' +
                'scope=everything&' +
                `state=${this.signInState}#` +
                `${sessionHandler.getItem('HC_Id')}`;

            document.body.appendChild(iframe);
        });
    }

    static handleIframe(iframe, callback) {
        let iframeLocation;
        try {
            iframeLocation = iframe.contentWindow.location;
            if (iframeLocation.origin !== window.location.origin) return false;
        } catch (err) { // TODO handle this better
            return false;
        }
        if (iframeLocation.pathname === location.pathname) {
            const queryString = iframeLocation.search || iframeLocation.hash;

            document.body.removeChild(iframe);
            if (queryString && queryString.indexOf('error') !== -1) {
                callback(getCodeFromString(queryString, 'error'));
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
                sessionHandler.setItem('HC_Auth', res.access_token);
            });
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
                        sessionHandler.setItem('HC_Auth', res.access_token);
                        sessionHandler.setItem('HC_Refresh', res.refresh_token);
                        resolve(res);
                    })
                    .catch(err => reject(err));
            }
        });
    }

    static logout() {
        return authRoutes.revokeRefreshToken(sessionHandler.getItem('HC_Refresh'))
            .then(sessionHandler.logout.bind(sessionHandler));
    }
}


export default Auth;
