import config from 'config';
import request from 'superagent-bluebird-promise';
import sessionHandler from 'session-handler';
import authRoutes from '../routes/authRoutes';

const buildCustomError = error => ({
    status: error.status,
    error: error.body || error,
});

const sendRefreshToken = () => {
    const params = {
        refresh_token: sessionHandler.getItem('HC_Refresh'),
        grant_type: 'refresh_token',
    };

    return authRoutes.getRefreshTokenFromCode(params)
        .then((res) => {
            sessionHandler.setItem('HC_Auth', res.access_token);
            sessionHandler.setItem('HC_Refresh', res.refresh_token);
            return res;
        });
};

const isExpired = error =>
    error.status === 401 && error.body && error.body.error && error.body.error.includes('expired');

const isHealthCloudPath = path => path.startsWith(config.api);

const hcRequest = (type, path, {
    body,
    query = {},
    headers = {},
    responseType = '',
    authorize = false,
    includeResponseHeaders = false,
} = {}) => {
    let retries = 0;

    const promise = () => {
        if (authorize) {
            headers.Authorization = `Bearer ${sessionHandler.getItem('HC_Auth')}`;
        }
        if (isHealthCloudPath(path)) {
            headers = { 'GC-SDK-Version': `JS ${VERSION}`, ...headers };
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
            })
            .catch((err) => {
                if (isExpired(err) && retries < 2) {
                    retries += 1;
                    return sendRefreshToken()
                        .then(() => promise());
                }
                throw buildCustomError(err);
            });
    };

    return promise();
};


export default hcRequest;
