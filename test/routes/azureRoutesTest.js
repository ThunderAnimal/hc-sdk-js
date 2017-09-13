/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';
import '../../src/routes/azureRoutes';

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('azureRoutes', () => {
	let	requestStub;
	let azureRoutes;


	beforeEach(() => {
		requestStub = sinon.stub().returnsPromise();
	});

	it('downloadDocument passes', (done) => {
		azureRoutes = proxyquire('../../src/routes/azureRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

		azureRoutes.downloadDocument('fakeSasUrl', 'fakeDocumentBlob').then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('GET');
			done();
		});
		requestStub.reset();
	});


	it('uploadDocument passes', (done) => {
		azureRoutes = proxyquire('../../src/routes/azureRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

		azureRoutes.uploadDocument('fakeSasUrl', 'fakeDocumentBlob').then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('PUT');
			done();
		});
		requestStub.reset();
	});

	it('uploadDocument returns error if hcRequest returns error', (done) => {
		azureRoutes = proxyquire('../../src/routes/azureRoutes', {
			'../lib/hcRequest': { default: requestStub.rejects('error') },
		}).default;

		azureRoutes.uploadDocument('fakeSasUrl', 'fakeDocumentBlob').catch((res) => {
			expect(res).to.equal('error');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('PUT');
			done();
		});
		requestStub.reset();
	});
});
