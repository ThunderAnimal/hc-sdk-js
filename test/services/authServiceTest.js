/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import config from 'config';

import authRoutes from '../../src/routes/authRoutes';
import sessionHandler from '../../src/lib/sessionHandler';
import AuthService from '../../src/services/AuthService';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('AuthService', () => {
	let authService;
	let accessTokenObject;

	let getAccessTokenFromCodeStub;
	let logoutStub;
	let revokeRefreshTokenStub;

	beforeEach(() => {
		config.api = 'http://fakeUrl';
		authService = new AuthService({ clientId: '1', userId: '3213' });
		accessTokenObject = {
			access_token: 'fake_access_token',
			expires_in: 3600,
			refresh_token: 'fake_refresh_token',
			scope: 'everything',
			token_type: 'Bearer',
		};

		document.body.removeChild = sinon.spy();
		sinon.spy(document.body, 'appendChild');

		getAccessTokenFromCodeStub = sinon.stub(authRoutes, 'getAccessTokenFromCode')
			.returnsPromise().resolves(accessTokenObject);
		logoutStub = sinon.stub(sessionHandler, 'logout')
			.returns();
		revokeRefreshTokenStub = sinon.stub(authRoutes, 'revokeRefreshToken')
			.returnsPromise().resolves();
	});

	it('authorize() succeeds', (done) => {
		const handleIframeStub =
			sinon.stub(authService, 'handleIframe')
				.yields(null, `code=kjhdshcsjkhcfs&state=${config.signinState}`);

		document.cookie = 'HC_User=123;';
		authService.authorize()
			.then((res) => {
				expect(handleIframeStub).to.be.calledOnce;
				expect(res.access_token).to.equal('fake_access_token');
				expect(res.access_token).to.equal('fake_access_token');
				expect(getAccessTokenFromCodeStub).to.be.calledOnce;
				done();
			});
	});

	it('idpLogin succeeds', (done) => {
		const handleIframeStub = sinon.stub(authService, 'handleIframe');
		handleIframeStub
			.onCall(0)
			.yields(null, 'auth_token=kjhdshcsjkhcfs');
		handleIframeStub
			.onCall(1)
			.yields(null, `code=kjhdshcsjkhcfs&state=${config.signinState}`);
		authService.idpLogin().then((res) => {
			expect(res.access_token).to.equal('fake_access_token');
			expect(res.refresh_token).to.equal('fake_refresh_token');
			expect(handleIframeStub).to.be.calledTwice;
			expect(getAccessTokenFromCodeStub).to.be.calledOnce;
			done();
		});
	});

	it('idpLogin returns error when token api returns error', (done) => {
		const handleIframeStub = sinon.stub(authService, 'handleIframe');
		handleIframeStub.onCall(0).yields(null, 'auth_token=kjhdshcsjkhcfs');
		handleIframeStub.onCall(1).yields('failed');
		authService.idpLogin().catch((err) => {
			expect(err).to.equal('failed');
			expect(handleIframeStub).to.be.calledTwice;
			expect(getAccessTokenFromCodeStub).to.not.be.called;
			done();
		});
	});

	it('idpLogin returns error when failing', (done) => {
		const handleIframeStub = sinon.stub(authService, 'handleIframe');
		handleIframeStub.onCall(0).yields('failed');
		handleIframeStub.onCall(1).yields('failed');
		authService.idpLogin().catch((err) => {
			expect(err).to.equal('failed');
			expect(handleIframeStub).to.be.calledOnce;
			expect(getAccessTokenFromCodeStub).to.not.be.called;
			done();
		});
	});

	it('handleIframe loads and handles iframe correctly', (done) => {
		const iframe = {
			contentWindow: {
				location: {
					origin: window.location.origin,
					pathname: location.pathname,
					search: 'code=fakeCode&state=fakeState',
				},
			},
		};

		authService.handleIframe(iframe, (err, result) => {
			expect(result).to.equal('code=fakeCode&state=fakeState');
			done();
		});
	});

	it('loadAndHandleIframe returns error in case iframe returns error', (done) => {
		const iframe = {
			contentWindow: {
				location: {
					origin: window.location.origin,
					pathname: location.pathname,
					search: 'error=Failed',
				},
			},
		};

		authService.handleIframe(iframe, (err) => {
			expect(err).to.equal('Failed');
			done();
		});
	});

	it('logout - Happy Path', (done) => {
		authService.logout()
			.then(() => {
				expect(logoutStub).to.be.calledOnce;
				expect(revokeRefreshTokenStub).to.be.calledOnce;
				done();
			});
	});

	afterEach(() => {
		getAccessTokenFromCodeStub.restore();
		logoutStub.restore();
		revokeRefreshTokenStub.restore();
		document.body.appendChild.restore();
	});
});
