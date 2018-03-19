import config from 'config';
import request from 'superagent-bluebird-promise';

const isHealthCloudPath = path => path.startsWith(config.api);

const hcRequest = {
    accessToken: undefined,

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
        const h = headers;
        if (authorize) {
            h.Authorization = this.accessToken;
        }
        if (isHealthCloudPath(path)) {
            h['GC-SDK-Version'] = `JS ${VERSION}`;
        }
        return request(type, path)
            .set(headers)
            .query(query)
            .responseType(responseType)
            .send(body)
            .then((res) => {
                if (includeResponseHeaders) {
                    return ({ body: res.body, headers: res.headers });
                }
                return res.body || res.text;
            });
        // TODO handle errors
    },
};


export default hcRequest;
