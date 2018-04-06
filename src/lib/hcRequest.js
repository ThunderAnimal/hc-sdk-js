import config from 'config';
import request from 'superagent-bluebird-promise';

const maxRetries = 2;

const isHealthCloudPath = path => path.startsWith(config.api);

const isExpired = error =>
    error.status === 401 && error.body && error.body.error && error.body.error.includes('expired');

const hcRequest = {
    accessToken: null,

    requestAccessToken: null,

    setAccessToken(accessToken) {
        this.accessToken = `Bearer ${accessToken}`;
    },

    submit(type, path, {
        body,
        query = {},
        headers = {},
        responseType = '',
        authorize = false,
        includeResponseHeaders = false,
    } = {}) {
        let retries = 0;

        const h = headers;
        if (authorize) {
            h.Authorization = this.accessToken;
        }
        if (isHealthCloudPath(path)) {
            h['GC-SDK-Version'] = `JS ${VERSION}`;
        }
        const submitRequest = () => request(type, path)
            .set(headers)
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
                    return this.requestAccessToken()
                        .then(() => submitRequest());
                }
                throw err;
            });

        return submitRequest();
    },
};


export default hcRequest;
