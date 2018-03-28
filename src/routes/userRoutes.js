import config from 'config';
import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const userRoutes = {
    resolveUserId(hcUserAlias) {
        const body = { value: hcUserAlias };

        return hcRequest.submit('POST', `${apiUrl}/users/resolve`, { body });
    },

    getUserDetails(userId) {
        return hcRequest.submit('GET', `${apiUrl}/users/${userId}`, { authorize: true });
    },

    updateUser(userId, userData) {
        return hcRequest.submit('PUT', `${apiUrl}/users/${userId}`, { body: userData, authorize: true });
    },
};

export default userRoutes;
