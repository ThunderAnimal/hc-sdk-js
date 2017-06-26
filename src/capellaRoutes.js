import hcRequest from './hcRequest';

const capellaRoutes = {};

const capellaUrl = 'http://localhost:8080';

capellaRoutes.initRegistration = function (hcUsername) {
	return hcRequest('POST', `${capellaUrl}/v1/users/register/init`, { email: hcUsername });
};

capellaRoutes.validateRegistration = function (validationVerifier, zerokitId) {
	return hcRequest('POST', `${capellaUrl}/v1/users/register/finish`, { validation_verifier: validationVerifier, zerokit_id: zerokitId });
};

capellaRoutes.resolveUserId = function (hcUsername) {
	return hcRequest('GET', `${capellaUrl}/v1/users/resolve`, { email: hcUsername });
};

export default capellaRoutes;
