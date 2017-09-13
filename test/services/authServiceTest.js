/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';

import siriusRoutes from '../../src/routes/authRoutes';
import Auth from '../../src/services/AuthService';
import config from '../../src/config';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('Auth', () => {
	let auth;
	let getAccessTokenFromCodeStub;
	let accessTokenObject;
	config.api.auth = 'http://fakeUrl';

	beforeEach(() => {
		auth = new Auth({ clientId: '1', userId: '3213' });
		accessTokenObject = {
			access_token: 'fake_access_token',
			expires_in: 3600,
			refresh_token: 'fake_refresh_token',
			scope: 'everything',
			token_type: 'Bearer',
		};

		document.body.removeChild = sinon.spy();
		sinon.spy(document.body, 'appendChild');

		getAccessTokenFromCodeStub =
			sinon.stub(siriusRoutes, 'getAccessTokenFromCode')
				.returnsPromise().resolves(accessTokenObject);
	});

	it('authorize() succeeds', (done) => {
		const handleIframeStub =
			sinon.stub(auth, 'handleIframe')
				.yields(null, `code=kjhdshcsjkhcfs&state=${config.signinState}`);

		document.cookie = 'HC_User=123;';
		auth.authorize()
			.then((res) => {
				expect(handleIframeStub).to.be.calledOnce;
				expect(res.access_token).to.equal('fake_access_token');
				expect(res.access_token).to.equal('fake_access_token');
				expect(getAccessTokenFromCodeStub).to.be.calledOnce;
				done();
			});
	});

	it('idpLogin succeeds', (done) => {
		const handleIframeStub = sinon.stub(auth, 'handleIframe');
		handleIframeStub
			.onCall(0)
			.yields(null, 'auth_token=kjhdshcsjkhcfs');
		handleIframeStub
			.onCall(1)
			.yields(null, `code=kjhdshcsjkhcfs&state=${config.signinState}`);
		auth.idpLogin().then((res) => {
			expect(res.access_token).to.equal('fake_access_token');
			expect(res.refresh_token).to.equal('fake_refresh_token');
			expect(handleIframeStub).to.be.calledTwice;
			expect(getAccessTokenFromCodeStub).to.be.calledOnce;
			done();
		});
	});

	it('idpLogin returns error when token api returns error', (done) => {
		const handleIframeStub = sinon.stub(auth, 'handleIframe');
		handleIframeStub.onCall(0).yields(null, 'auth_token=kjhdshcsjkhcfs');
		handleIframeStub.onCall(1).yields('failed');
		auth.idpLogin().catch((err) => {
			expect(err).to.equal('failed');
			expect(handleIframeStub).to.be.calledTwice;
			expect(getAccessTokenFromCodeStub).to.not.be.called;
			done();
		});
	});

	it('idpLogin returns error when failing', (done) => {
		const handleIframeStub = sinon.stub(auth, 'handleIframe');
		handleIframeStub.onCall(0).yields('failed');
		handleIframeStub.onCall(1).yields('failed');
		auth.idpLogin().catch((err) => {
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

		auth.handleIframe(iframe, (err, result) => {
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

		auth.handleIframe(iframe, (err) => {
			expect(err).to.equal('Failed');
			done();
		});
	});

	afterEach(() => {
		siriusRoutes.getAccessTokenFromCode.restore();
		document.body.appendChild.restore();
	});
});
