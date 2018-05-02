import config from 'config';
import request from 'superagent-bluebird-promise';
import authRoutes from '../routes/authRoutes';


const maxRetries = 2;

const isHealthCloudPath = path => path.startsWith(config.api);

const isExpired = error =>
    error.status === 401 && error.body && error.body.error && error.body.error.includes('expired');

const hcRequest = {
    currentUserId: null,
    masterAccessToken: null,
    accessTokens: {},

    requestAccessToken: null,

    setMasterAccessToken(accessToken) {
        this.masterAccessToken = `Bearer ${accessToken}`;
    },

    setAccessToken(userId, accessToken) {
        this.accessTokens[userId] = `Bearer ${accessToken}`;
    },

    getAccessToken(ownerId) {
        if (!ownerId || ownerId === this.currentUserId) {
            return Promise.resolve(this.masterAccessToken);
        }
        if (this.accessTokens[ownerId]) {
            return Promise.resolve(this.accessTokens[ownerId]);
        }
        return authRoutes.fetchAccessToken(ownerId)
            .then((response) => {
                this.setAccessToken(ownerId, response.access_token);
                return this.accessTokens[ownerId];
            });
    },

    submit(type, path, {
        body,
        query = {},
        givenHeaders = {},
        responseType = '',
        authorize = false,
        ownerId = null,
        includeResponseHeaders = false,
    } = {}) {
        let retries = 0;
        const headers = givenHeaders;

        const accessTokenPromise = authorize ? this.getAccessToken(ownerId) : Promise.resolve(null);

        if (isHealthCloudPath(path)) {
            headers['GC-SDK-Version'] = `JS ${VERSION}`;
        }
        const submitRequest = accessToken => request(type, path)
            .set(headers)
            .set('Authorization', accessToken)
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
                        this.accessTokens[ownerId] = null;
                        refreshPromise = this.getAccessToken(ownerId);
                    } else {
                        refreshPromise = this.requestAccessToken();
                    }

                    return refreshPromise
                        .then(() => submitRequest());
                }
                throw err;
            });

        return accessTokenPromise.then(submitRequest);
    },
};


export default hcRequest;
