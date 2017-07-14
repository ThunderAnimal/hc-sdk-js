/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import capellaRoutes from '../../src/routes/capellaRoutes';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;
const assert = chai.assert;


describe('capellaRoutes', () => {
	// let capellaRoutes;
	let	requestStub;
	let failureStub;


	beforeEach(() => {
		let response = { response: 'response' };
	});


	it('initial registration passes', () => {
		let hcUsername = 'test';
		requestStub = sinon.stub(capellaRoutes, 'hcRequest').returnsPromise().resolves('pass');

		capellaRoutes.initRegistration(hcUsername).then((res) => {
		    expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
		});

		requestStub.reset();
	});

	it('initial registration function yields failure, when the request get rejected', (done) => {
		failureStub = sinon.stub(capellaRoutes, 'hcRequest').returnsPromise().rejects('TypeError');

		capellaRoutes.initRegistration('test').then((res) => {
			expect(failureStub).to.be.calledOnce;
		});
		failureStub.reset();

		done();
	});

	it('should test that validate registration passes', (done) => {
		requestStub = sinon.stub(capellaRoutes, 'hcRequest').returnsPromise().resolves('pass');

		capellaRoutes.validateRegistration('testUsername', '12345').then((res) => {
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
		});
		requestStub.reset();

		done();
	});

	it('should resolve  userId', (done) => {
		failureStub = sinon.stub(capellaRoutes, 'hcRequest').returnsPromise().rejects('TypeError');

		capellaRoutes.resolveUserId('test').then(() => {
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
		});

		failureStub.reset();

		done();
	});

	afterEach(() => {
	});
});
