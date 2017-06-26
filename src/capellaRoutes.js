import hcRequest from './hcRequest';

const capellaRoutes = {};

const capellaUrl = 'http://localhost:8080';

capellaRoutes.initRegistration = function (hcUsername) {
	// Todo remove auto_validate when proper validation is implementedgit
	return hcRequest('POST', `${capellaUrl}/v1/users/register/init`, { email: hcUsername, user_data: { auto_validate: true } });
};

capellaRoutes.validateRegistration = function (validationVerifier, zerokitId) {
	return hcRequest('POST', `${capellaUrl}/v1/users/register/finish`, { validation_verifier: validationVerifier, zerokit_id: zerokitId });
};

capellaRoutes.resolveUserId = function (hcUsername) {
	return hcRequest('POST', `${capellaUrl}/v1/users/resolve`, { value: hcUsername });
};

export default capellaRoutes;
