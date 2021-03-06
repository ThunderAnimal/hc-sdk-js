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

    fetchUserInfo(userId) {
        return hcRequest.submit('GET', `${apiUrl}/userinfo`, { authorize: true, ownerId: userId });
    },

    updateUser(userId, userData) {
        return hcRequest.submit('PUT', `${apiUrl}/users/${userId}`, { body: userData, authorize: true });
    },

    getReceivedPermissions(userId) {
        return hcRequest.submit('GET', `${apiUrl}/users/${userId}/permissions`, { authorize: true });
    },

    getCAPs(appId) {
        return hcRequest.submit('GET', `${apiUrl}/permissions`, { authorize: true, query: { app_id: appId } });
    },

    grantPermission(ownerId, granteeId, appId, commonKey, scope) {
        const scopeString = scope.join(' ');
        const body = {
            grantee: granteeId,
            common_key: commonKey,
            app_id: appId,
            scope: scopeString,
        };
        return hcRequest.submit('POST', `${apiUrl}/users/${ownerId}/permissions`, { body, authorize: true });
    },
};

export default userRoutes;
