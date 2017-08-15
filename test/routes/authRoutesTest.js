/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';
import '../../src/routes/authRoutes';

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('user Routes', () => {
	let	requestStub;
	let authRoutes;


	beforeEach(() => {
		requestStub = sinon.stub().returnsPromise();
		document.cookie = 'SQLiteManager_currentLangue=2; HC_User=c7212d03-34e9-40ab-9029-ed66' +
			'2ecb7f0b,1';
	});

	it('getAccessTokenFromCode passes', (done) => {
		authRoutes = proxyquire('../../src/routes/authRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

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
		requestStub.reset();
	});

	it('getRefreshTokenFromCode passes', (done) => {
		authRoutes = proxyquire('../../src/routes/authRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

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
		requestStub.reset();
	});

	afterEach(() => {
	});
});
