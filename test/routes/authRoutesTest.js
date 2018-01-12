/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';
import config from 'config';
import '../../src/routes/authRoutes';
import testVariables from '../testUtils/testVariables';

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('auth Routes', () => {
	let	requestStub;
	let authRoutes;
	let expectedParamsForClientCredsGrantType;
	let expectedHeadersForClientCredsGrantType;
	let credentialsStub;


	beforeEach(() => {
		requestStub = sinon.stub().returnsPromise();
		document.cookie = 'SQLiteManager_currentLangue=2; HC_User=c7212d03-34e9-40ab-9029-ed66' +
			'2ecb7f0b,1';

		expectedHeadersForClientCredsGrantType = {
			'Content-Type': 'application/x-www-form-urlencoded',
		};
		expectedParamsForClientCredsGrantType = {
			client_id: testVariables.clientId,
			scope: `user:${testVariables.userId}`,
			grant_type: 'client_credentials',
			client_secret: testVariables.clientSecret,
		};


		credentialsStub = sinon.stub().returnsPromise();
		credentialsStub.rejects('fail');
		credentialsStub.withArgs('POST', `${config.api}/auth/token`, { body: expectedParamsForClientCredsGrantType, headers: expectedHeadersForClientCredsGrantType })
			.resolves('pass');

		authRoutes = proxyquire('../../src/routes/authRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;
	});

	it('getAccessTokenFromCode passes', (done) => {
		const params = {
			client_id: 'fakeClientId',
			redirect_uri: 'http://fakeUrlPath',
			grant_type: 'authorization_code',
			code: 'fakeCode',
		};
		authRoutes.getAccessTokenFromCode(params).then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('getAccessTokenFromCredentials passes', (done) => {
		const params = {
			client_id: testVariables.clientId,
			scope: `user:${testVariables.userId}`,
			grant_type: 'client_credentials',
			client_secret: testVariables.clientSecret,
		};

		authRoutes = proxyquire('../../src/routes/authRoutes', {
			'../lib/hcRequest': { default: credentialsStub },
		}).default;

		authRoutes.getAccessTokenFromCredentials(params).then((res) => {
			expect(res).to.equal('pass');
			expect(credentialsStub).to.be.calledOnce;
			expect(credentialsStub).to.be.calledWith('POST');
			done();
		}).catch(done);
	});

	it('getAccessTokenFromCredentials fails when wrong client_secret is passed', (done) => {
		const actualParams = {
			client_id: testVariables.clientId,
			scope: `user:${testVariables.userId}`,
			grant_type: 'client_credentials',
			client_secret: testVariables.wrongClientSecret,
		};
		authRoutes = proxyquire('../../src/routes/authRoutes', {
			'../lib/hcRequest': { default: credentialsStub },
		}).default;

		authRoutes = proxyquire('../../src/routes/authRoutes', {
			'../lib/hcRequest': { default: credentialsStub },
		}).default;

		authRoutes.getAccessTokenFromCredentials(actualParams)
			.then(() => done(Error('getAccessTokenFromCredentials rejection didn\'t work properly in authRoutes.getAccessTokenFromCredentials')))
			.catch((err) => {
				expect(err).to.equal('fail');
				expect(credentialsStub).to.be.calledOnce;
				expect(credentialsStub).to.be.calledWith('POST');
				done();
			});
	});

	it('getRefreshTokenFromCode passes', (done) => {
		const params = {
			client_id: 'fakeClientId',
			redirect_uri: 'http://fakeUrlPath',
			grant_type: 'access_token',
			code: 'fakeCode',
		};
		authRoutes.getRefreshTokenFromCode(params).then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('revokeAccesToken - Happy Path', (done) => {
		authRoutes.revokeRefreshToken(testVariables.refreshToken)
			.then(() => {
				expect(requestStub).to.be.calledOnce;
				expect(requestStub.firstCall.args[0]).to.equal('POST');
				expect(requestStub.firstCall.args[2].body)
					.to.deep.equal({ token: testVariables.refreshToken });
				done();
			})
			.catch(done);
	});

	afterEach(() => {
		requestStub.reset();
		credentialsStub.reset();
	});
});
