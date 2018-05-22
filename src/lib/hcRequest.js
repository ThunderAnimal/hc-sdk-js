import config from 'config';
import request from 'superagent-bluebird-promise';
import authRoutes from '../routes/authRoutes';


const maxRetries = 2;

const isHealthCloudPath = path => path.startsWith(config.api);

const isExpired = error =>
    error.status === 401 && error.body && error.body.error && error.body.error.includes('expired');

const hcRequest = {
    currentUserId: null,
    // the accessToken of the logged in user, which is used for getting other users tokens
    masterAccessToken: null,
    accessTokens: {},

    /**
     * @returns {Promise<String>} resolves to the accessToken of the logged in user
    */
    requestAccessToken: null,

    reset() {
        this.currentUserId = null;
        this.masterAccessToken = null;
        this.accessTokens = {};
    },

    setMasterAccessToken(accessToken) {
        this.masterAccessToken = `Bearer ${accessToken}`;
    },

    setAccessToken(userId, accessToken) {
        this.accessTokens[userId] = `Bearer ${accessToken}`;
    },

    /**
     * returns the accessToken if known or fetches it for the given ownerId and stores it.
     *
     * @param {String} ownerId=null - accessToken's ownerId, logged in user's by default
     * @returns {Promise<String>} the accessToken of the requested owner
     */
    getAccessToken(ownerId) {
        // getAccessToken for current user's access token
        if (!ownerId || ownerId === this.currentUserId) {
            return Promise.resolve(this.masterAccessToken);
        }
        // getAccessToken for other user's access token
        if (this.accessTokens[ownerId]) {
            return Promise.resolve(this.accessTokens[ownerId]);
        }

        // fetch for accessToken for the given user
        return authRoutes.fetchAccessToken(ownerId)
            .then((response) => {
                this.setAccessToken(ownerId, response.access_token);
                return this.accessTokens[ownerId];
            });
    },

    submit(type, path, {
        body,
        query = {},
        headers = {},
        responseType = '',
        authorize = false,
        ownerId = null,
        includeResponseHeaders = false,
    } = {}) {
        let retries = 0;
        const httpHeaders = headers;

        // noop promise if authorize is not set
        const accessTokenPromise = authorize ? this.getAccessToken(ownerId) : Promise.resolve(null);

        if (isHealthCloudPath(path)) {
            // TODO uncomment whenever vega allows the version Header
            // httpHeaders['GC-SDK-Version'] = `JS ${VERSION}`;
        }

        const submitRequest = accessToken => request(type, path)
            .set({
                ...httpHeaders,
                authorization: accessToken,
            })
            .query(query)
            .responseType(responseType)
            .send(body)
            .then((res) => {
                if (includeResponseHeaders) {
                    return ({ body: res.body, headers: res.headers });
                }
                return res.body || res.text;
            })
            .catch((err) => {
                if (isExpired(err) && this.requestAccessToken && retries < maxRetries) {
                    retries += 1;
                    let refreshPromise;
                    if (ownerId) {
                        // invalidate user's access token and get a new one
                        this.accessTokens[ownerId] = null;
                        refreshPromise = this.getAccessToken(ownerId);
                    } else {
                        // request accessToken for the logged in user's accessToken and set it
                        refreshPromise = this.requestAccessToken()
                            .then(token => this.setMasterAccessToken(token));
                    }

                    return refreshPromise
                        .then(token => submitRequest(token));
                }
                throw err;
            });

        return accessTokenPromise.then(submitRequest);
    },
};


export default hcRequest;
