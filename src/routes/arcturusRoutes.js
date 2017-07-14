import hcRequest from '../hcRequest';
import config from '../config';

const arcturusRoutes = {};

const arcturusUrl = config.api.arcturus;

arcturusRoutes.getUserDocuments = function (hcUsername) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents`);
};

arcturusRoutes.getUserDocumentSAS = function (hcUsername, documentId) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}/access_token`);
};

arcturusRoutes.getUserDocumentMetadata = function (hcUsername, documentId) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}`);
};

arcturusRoutes.getUserDocumentPreview = function (hcUsername, documentId) {
	return hcRequest('GET', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}/preview`);
};

arcturusRoutes.getUploadUserDocumentSAS = function (hcUsername, body) {
	return hcRequest('POST', `${arcturusUrl}/v1/users/${hcUsername}/documents`, body);
};

arcturusRoutes.getChangeUserDocumentSAS = function (hcUsername, documentId, body) {
	return hcRequest('POST', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}`, body);
};

arcturusRoutes.getDeleteUserDocumentSAS = function (hcUsername, documentId) {
	return hcRequest('DELETE', `${arcturusUrl}/v1/users/${hcUsername}/documents/${documentId}`);
};

export default arcturusRoutes;
