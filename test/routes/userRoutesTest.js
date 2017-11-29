/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';
import '../../src/routes/userRoutes';

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('userRoutes', () => {
	let	requestStub;
	let userRoutes;

	beforeEach(() => {
		requestStub = sinon.stub().returnsPromise();
		userRoutes = proxyquire('../../src/routes/userRoutes', {
			'../lib/hcRequest': { default: requestStub },
		}).default;
	});

	it('initRegistration passes', (done) => {
		const hcUserAlias = 'test';
		requestStub.resolves('pass');
		userRoutes.initRegistration(hcUserAlias).then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('initRegistration yields failure, when the request gets rejected', (done) => {
		requestStub.rejects('error');
		userRoutes.initRegistration('test').catch((err) => {
			expect(err).to.equal('error');
			expect(requestStub).to.be.calledOnce;
			done();
		});
	});

	it('validateRegistration passes', (done) => {
		requestStub.resolves('pass');
		userRoutes.validateRegistration('testUserAlias', '12345').then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('resolveUserId returns error on request failure', (done) => {
		requestStub.rejects('error');
		userRoutes.resolveUserId('test').catch((err) => {
			expect(err).to.equal('error');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('add tresor passes', (done) => {
		requestStub.resolves('pass');
		userRoutes.addTresor('userId', 'test').then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('verifyShareAndGrantPermission passes', (done) => {
		requestStub.resolves('pass');
		userRoutes.verifyShareAndGrantPermission('ownerId',
			'granteeId', 'operationId').then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('verifyShareAndGrantPermission returns error on request failure', (done) => {
		requestStub.rejects('error');
		userRoutes.verifyShareAndGrantPermission('ownerId',
			'granteeId', 'operationId').catch((err) => {
			expect(err).to.equal('error');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
	});

	it('updateUser passes', (done) => {
		requestStub.resolves('pass');
		userRoutes.updateUser({ name: 'fakeName' }).then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('PUT');
			done();
		});
	});

	it('updateUser returns error on request failure', (done) => {
		requestStub.rejects('error');
		userRoutes.updateUser({ name: 'fakeName' }).catch((err) => {
			expect(err).to.equal('error');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('PUT');
			done();
		});
	});

	afterEach(() => {
		requestStub.reset();
	});
});
