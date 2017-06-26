import hcRequest from './hcRequest';

const arcturusRoutes = {};

const arcturusUrl = 'http://localhost:8888';

arcturusRoutes.getUserDocuments = function (hcUsername) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents`);
};

arcturusRoutes.getUserDocumentSAS = function (hcUsername, documentId) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}`);
};

arcturusRoutes.getUserDocumentRaw = function (hcUsername, documentId) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}/raw`);
};

arcturusRoutes.getUserDocumentPreview = function (hcUsername, documentId) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}/preview`);
};

arcturusRoutes.getUploadUserDocumentSAS = function (hcUsername, documentId) {
	return hcRequest('POST', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}`);
};

arcturusRoutes.getChangeUserDocumentSAS = function (hcUsername, documentId) {
	return hcRequest('PUT', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}`);
};

arcturusRoutes.getDeleteUserDocumentSAS = function (hcUsername, documentId) {
	return hcRequest('DELETE', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}`);
};

export default arcturusRoutes;
