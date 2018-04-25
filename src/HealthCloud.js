import escapeStringRegexp from 'escape-string-regexp';
import superagent from 'superagent';
import createClientEncryptionService from './services/cryptoService';
import crypto from './lib/crypto';
import documentService from './services/documentService';
import hcRequest from './lib/hcRequest';
import taggingUtils from './lib/taggingUtils';
import userService from './services/userService';
import HCDocument from './lib/models/HCDocument';
import HCAttachment from './lib/models/HCAttachment';
import HCAuthor from './lib/models/HCAuthor';
import HCSpecialty from './lib/models/HCSpecialty';
import userRoutes from './routes/userRoutes';


const healthCloud = {
    downloadDocument: documentService.downloadDocument.bind(documentService),
    deleteDocument: documentService.deleteDocument.bind(documentService),
    getDocuments: documentService.getDocuments.bind(documentService),
    getDocumentsCount: documentService.getDocumentsCount.bind(documentService),
    uploadDocument: documentService.uploadDocument.bind(documentService),
    updateDocument: documentService.updateDocument.bind(documentService),
    getCurrentUser: userService.getCurrentUser.bind(userService),
    getUserIdByAlias: userService.getUserIdForAlias.bind(userService),
    getUser: userService.getUser.bind(userService),
    updateUser: userService.updateUser.bind(userService),
    logout: userService.resetUser.bind(userService),
    updateAccessToken: hcRequest.setAccessToken.bind(hcRequest),
    getReceivedPermissions: userRoutes.getReceivedPermissions,
    createCAP: () =>
        crypto.generateAsymKeyPair(crypto.keyTypes.APP).then(({ publicKey, privateKey }) => ({
            publicKey: btoa(JSON.stringify(publicKey)),
            privateKey: btoa(JSON.stringify(privateKey)),
        })),

    models: {
        HCDocument,
        HCAttachment,
        HCAuthor,
        HCSpecialty,
    },

    setup(clientId, userId, privateKey, accessToken, requestAccessToken) {
        taggingUtils.clientId = clientId;
        documentService.setEncryptionService(
            createClientEncryptionService(clientId)(privateKey));
        hcRequest.setAccessToken(accessToken);
        hcRequest.requestAccessToken = requestAccessToken;
        userService.currentUser = userId;
    },
};

// moves to config of the authCloud
const terra = 'http://localhost:8080';
const accessTokenUri = `${terra}/oauth/token`;
const authorizationUri = `${terra}/oauth/authorize`;
// moves to Icarus?
const redirectUri = 'http://localhost:8888/';


// is going to be an own sdk
const authCloud = {
    login(clientId, CAP) {
        const scope = 'everything';
        const oauthResponseType = 'code';

        localStorage.setItem('clientId', clientId);
        // going to be stored in Icarus
        localStorage.setItem('CAP', JSON.stringify(CAP));

        window.location.replace(`${authorizationUri}?response_type=${oauthResponseType}&client_id=${clientId}&public_key=${CAP.publicKey}&scope=${scope}`);
    },

    continue_login() {
        const codeRegex = /\?code=(.*)&/;
        const code = window.location.href.match(codeRegex);
        const clientId = localStorage.getItem('clientId');
        const clientSecret = 'terra'; // '$2a$10$cXsZy8UM5bmLHymzDCGTkes3ESo0tl1DjpAHLNkhHfOLlajzeSTDq'; NOT GOING TO BE IN THE SDK(Icarus)
        const oauthGrantType = 'authorization_code'; // NOT GOING TO BE IN THE SDK(Icarus)

        superagent('POST', accessTokenUri)
            .send(`client_id=${clientId}`)
            .send(`client_secret=${clientSecret}`)
            .send(`redirect_uri=${redirectUri}`)
            .send(`grant_type=${oauthGrantType}`)
            .send(`code=${code[1]}`)
            .then((res) => {
                const token = JSON.parse(res.text);
                const CAP = localStorage.getItem('CAP');
                healthCloud.setup(clientId, null, CAP.privateKey, token.access_token, () => {
                    superagent('POST', accessTokenUri)
                        .send(`client_id=${clientId}`)
                        .send(`client_secret=${clientSecret}`)
                        .send(`redirect_uri=${redirectUri}`)
                        .send(`grant_type=${oauthGrantType}`)
                        .send(`code=${res.refreshToken}`)
                        .then(accessToken => accessToken);
                });
            });
    },
};

const isLoginRegex = new RegExp(`${escapeStringRegexp(redirectUri)}\\?code=(.*)state=(.*)`);
if (isLoginRegex.test(window.location.href)) {
    authCloud.continue_login();
}


module.exports = { healthCloud, authCloud };
