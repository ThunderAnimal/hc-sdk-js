import hcRequest from '../hcRequest';
import config from '../config';

const capellaRoutes = {};

const capellaUrl = config.api.capella;

capellaRoutes.initRegistration = function (hcUsername) {
	// Todo remove auto_validate when proper validation is implemented
	return hcRequest('POST', `${capellaUrl}/v1/users/register/init`, { email: hcUsername, user_data: { auto_validate: true } });
};

capellaRoutes.validateRegistration = function (validationVerifier, zerokitId) {
	return hcRequest('POST', `${capellaUrl}/v1/users/register/finish`, { validation_verifier: validationVerifier, zerokit_id: zerokitId });
};

capellaRoutes.resolveUserId = function (hcUsername) {
	return hcRequest('POST', `${capellaUrl}/v1/users/resolve`, { value: hcUsername });
};

capellaRoutes.addTresor = function (zerokitId, tresorId) {
	return hcRequest('POST', `${capellaUrl}/v1/tresors`, { zerokit_id: zerokitId, tresor_id: tresorId });
};

export default capellaRoutes;
