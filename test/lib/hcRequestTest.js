/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonStubPromise from 'sinon-stub-promise';
import proxy from 'proxyquireify';
import '../../src/lib/hcRequest';

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('hcRequest', () => {
	let requestSetStub;
	let requestSendStub;
	let requestStub;
	let hcRequest;

	beforeEach(() => {
	});

	it('hcRequest passes when api sends successful response', (done) => {
		requestSetStub = sinon.stub().returns({
			send: requestSendStub,
			set: requestSetStub,
		});

		requestSendStub = sinon.stub().returns({
			end: (cb) => {
				cb(null, { ok: true, body: { status: '201' } });
			},
		});
		requestStub = sinon.stub().returns({
			set: requestSetStub,
			send: requestSendStub,
		});

		hcRequest = proxyquire('../../src/lib/hcRequest', { superagent: requestStub }).default;
		hcRequest('POST', 'path').then((res) => {
			expect(res.status).to.equal('201');
			expect(requestStub).to.be.calledWith('POST');
			expect(requestStub).to.be.calledOnce;
			done();
		});
	});

	it('hcRequest sends refresh request when api sends 401 unauthorised', (done) => {
		requestSetStub = sinon.stub().returns({
			send: requestSendStub,
			set: requestSetStub,
		});

		requestSendStub = sinon.stub();

		requestSendStub.onCall(0).returns({
			end: (cb) => {
				cb({ status: '401', message: 'Your Authorization Token has expired' });
			},
		});

		requestSendStub.onCall(1).returns({
			end: (cb) => {
				cb(null, { ok: true, body: { status: '201' } });
			},
		});

		requestStub = sinon.stub().returns({
			set: requestSetStub,
			send: requestSendStub,
		});

		const getRefreshTokenStub = sinon.stub().returnsPromise().resolves({
			access_token: 'fakeAccessToken', refresh_token: 'fakeRefreshToken',
		});

		hcRequest = proxyquire('../../src/lib/hcRequest', {
			'./sessionHandler': {
				default: {
					get() {
						return 'token';
					},
					set: sinon.stub().returns(true),
				},
			},
			'../routes/authRoutes': {
				default: { getRefreshTokenFromCode: getRefreshTokenStub },
			},
			superagent: requestStub,
		}).default;

		hcRequest('POST', '/users/fakeUserId/documents/fakeDocumentId')
			.then((res) => {
				expect(res.status).to.equal('201');
				expect(getRefreshTokenStub).to.be.calledOnce;
				done();
			});
	});


	afterEach(() => {
		requestSetStub.reset();
		requestSendStub.reset();
		requestStub.reset();
	});
});
