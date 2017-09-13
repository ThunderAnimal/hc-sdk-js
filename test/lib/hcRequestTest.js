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
		requestSendStub = sinon.stub().returnsPromise().resolves(
			{ ok: true, body: { status: '201' } },
		);

		requestSetStub = sinon.stub().returns({
			send: requestSendStub,
			set: sinon.stub().returns({
				send: requestSendStub,
				set: this,
				query: this,
			}),
			query: sinon.stub().returns({
				send: requestSendStub,
				set: this,
				query: this,
			}),
		});


		requestStub = sinon.stub().returns({
			set: requestSetStub,
			send: requestSendStub,
			query: requestSetStub,
		});

		hcRequest = proxyquire('../../src/lib/hcRequest', {
			'superagent-bluebird-promise': requestStub,
		}).default;
		hcRequest('POST', 'path').then((res) => {
			expect(res.status).to.equal('201');
			expect(requestStub).to.be.calledWith('POST');
			expect(requestStub).to.be.calledOnce;
			done();
		});
	});

	it('hcRequest sends refresh request when api sends 401 unauthorised', (done) => {
		requestSendStub = sinon.stub();

		requestSendStub.returnsPromise().onCall(0).rejects({
			status: '401', message: 'Your Authorization Token has expired',
		});
		requestSendStub.returnsPromise().onCall(1).resolves({ ok: true, body: { status: '201' } });


		requestSetStub = sinon.stub().returns({
			send: requestSendStub,
			set: sinon.stub().returns({
				send: requestSendStub,
				set: this,
				query: this,
			}),
			query: sinon.stub().returns({
				send: requestSendStub,
				set: this,
				query: this,
			}),
		});


		requestStub = sinon.stub().returns({
			set: requestSetStub,
			send: requestSendStub,
			query: requestSetStub,
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
			'superagent-bluebird-promise': requestStub,
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
