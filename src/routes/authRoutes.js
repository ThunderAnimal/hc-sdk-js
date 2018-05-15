import config from 'config';
import hcRequest from '../lib/hcRequest';

const apiUrl = config.api;

const authRoutes = {
    fetchAccessToken(userId) {
        const query = { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', owner: userId };
        return hcRequest.submit('POST', `${apiUrl}/oauth/token`, { query, authorize: true });
    },
};

export default authRoutes;
