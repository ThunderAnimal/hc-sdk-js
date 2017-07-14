import hcRequest from '../hcRequest';
import config from '../config';

const siriusRoutes = {};

const siriusUrl = config.api.sirius;

siriusRoutes.getAccessTokenFromCode = function (body) {
	return hcRequest('POST', `${siriusUrl}/v1/oauth2/token`, body, 'form');
};

siriusRoutes.getRefreshTokenFromCode = function (body) {
	return hcRequest('POST', `${siriusUrl}/v1/oauth2/token`, body, 'form');
};

export default siriusRoutes;
