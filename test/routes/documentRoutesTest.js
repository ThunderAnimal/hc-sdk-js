/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';
import '../../src/routes/documentRoutes';

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('documentRoutes', () => {
	let	requestStub;
	let documentRoutes;


	beforeEach(() => {
		requestStub = sinon.stub().returnsPromise();
	});

	it('getUserDocumentSAS passes', (done) => {
		documentRoutes = proxyquire('../../src/routes/documentRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

		documentRoutes.getUserDocumentSAS('fakeUserName', 'fakeDocumentId').then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('GET');
			done();
		});
		requestStub.reset();
	});

	it('getUserDocumentUploadDocumentSAS passes', (done) => {
		documentRoutes = proxyquire('../../src/routes/documentRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

		const params = {
			organizationId: '1',
			title: 'fakeTitle',
			documentType: 'fakeDocType',
			customFields: '',
			comment: '',
		};

		documentRoutes.getUploadUserDocumentSAS('fakeUserName', params).then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
		requestStub.reset();
	});

	it('changeUserDocument passes', (done) => {
		documentRoutes = proxyquire('../../src/routes/documentRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

		const params = {
			organizationId: '1',
			title: 'fakeTitle',
			docType: 'fakeDocType',
			customFields: '',
			comment: '',
		};

		documentRoutes.changeUserDocument('fakeUserName', params).then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('PUT');
			done();
		});
		requestStub.reset();
	});

	it('uploadRecord passes', (done) => {
		documentRoutes = proxyquire('../../src/routes/documentRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

		const params = {
			record_id: 'fakeRecordId',
			date: '2017-08-01',
			user_id: 'fakeUserIId',
			encrypted_body: 'fakeEncryptedBody',
			encrypted_tags: [
				'uzydrHX/3gGWZdZ69LizEA==',
				'+AJ9MhikiHxSX8sD3qdurw==',
			],
			version: 1,
			status: 'Active',
			createdAt: '2017-09-01T13:51:53.741',
		};

		documentRoutes.uploadRecord(params).then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('POST');
			done();
		});
		requestStub.reset();
	});

	it('downloadRecord passes', (done) => {
		documentRoutes = proxyquire('../../src/routes/documentRoutes', {
			'../lib/hcRequest': { default: requestStub.resolves('pass') },
		}).default;

		documentRoutes.downloadRecord('fakeRecordId').then((res) => {
			expect(res).to.equal('pass');
			expect(requestStub).to.be.calledOnce;
			expect(requestStub).to.be.calledWith('GET');
			done();
		});
		requestStub.reset();
	});
});
