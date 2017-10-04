/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import documentRoutes from '../../src/routes/documentRoutes';
import azureRoutes from '../../src/routes/azureRoutes';
import DocumentService from '../../src/services/DocumentService';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('DocumentService', () => {
	let documentService;

	const fhirResponse = {
		record_id: '0fc90924-ee65-482e-a553-8edabbc01588',
		date: '2017-09-19',
		user_id: '87db2013-b5e8-4886-9db1-32d52920b89d',
		encrypted_body: '/s6U2kgLtCLKIggFHzPDlXKX5OR7wwSXWt7mCD7AHKz2KXaGBOHc=',
		encrypted_tags: [
			'qJf/OgbI4EVb28oxILB5qA==',
			'qJf/OgbI4EVb28oxILB5qA==',
		],
		version: 1,
		status: 'Active',
		createdAt: '2017-09-19T09:29:48.278',
	};

	beforeEach(() => {
		const zeroKitAdapter = {
			decrypt: sinon.stub(),
			encrypt: sinon.stub(),
		};
		documentService = new DocumentService({ zeroKitAdapter });


		documentService.fhirService.uploadFhirRecord = sinon.stub()
			.returnsPromise().resolves(fhirResponse);

		documentService.zeroKitAdapter.encrypt.returnsPromise().withArgs('9087')
			.returns('encryptedDocument');
	});

	it('downloadDocument succeeds', (done) => {
		const getUserDocumentSASStub =
			sinon.stub(documentRoutes, 'getDownloadUserDocumentToken')
				.returnsPromise().resolves({ sas_token: 'fakeSasToken' });
		const azureRoutesStub =
			sinon.stub(azureRoutes, 'downloadDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });

		documentService.fhirService.downloadFhirRecord = sinon.stub()
			.returnsPromise().resolves(fhirResponse);

		const expectedDocument = {
			document: 'decryptedDocument',
			record_id: '0fc90924-ee65-482e-a553-8edabbc01588',
			date: '2017-09-19',
			user_id: '87db2013-b5e8-4886-9db1-32d52920b89d',
			encrypted_body: '/s6U2kgLtCLKIggFHzPDlXKX5OR7wwSXWt7mCD7AHKz2KXaGBOHc=',
			encrypted_tags: [
				'qJf/OgbI4EVb28oxILB5qA==',
				'qJf/OgbI4EVb28oxILB5qA==',
			],
			version: 1,
			status: 'Active',
			createdAt: '2017-09-19T09:29:48.278',
		};

		documentService.zeroKitAdapter.decrypt.returnsPromise().withArgs('fakeContent')
			.returns('decryptedDocument');
		documentService.downloadDocument('k8hofmann', '9087').then((res) => {
			expect(res).to.deep.equal(expectedDocument);
			expect(getUserDocumentSASStub).to.be.calledOnce;
			expect(azureRoutesStub).to.be.calledOnce;
			done();
		});
	});

	it('uploadDocument succeeds', (done) => {
		const uploadUserDocumentSASSuccessStub =
			sinon.stub(documentRoutes, 'getUploadUserDocumentToken')
				.returnsPromise().resolves({ sas_token: 'fakeSasToken' });
		const azureUploadRoutesStub =
			sinon.stub(azureRoutes, 'uploadDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });
		const updateRecordStatusStub =
			sinon.stub(documentRoutes, 'updateRecordStatus')
				.returnsPromise().resolves({ content: 'fakeContent' });

		documentService.uploadDocument('k8hofmann', '9087').then(() => {
			expect(uploadUserDocumentSASSuccessStub).to.be.calledOnce;
			expect(azureUploadRoutesStub).to.be.calledOnce;
			expect(azureUploadRoutesStub).to.be.calledWith('fakeSasToken', 'encryptedDocument');
			expect(updateRecordStatusStub).to.be.calledOnce;
			documentRoutes.getUploadUserDocumentToken.restore();
			azureRoutes.uploadDocument.restore();
			documentRoutes.updateRecordStatus.restore();
			documentService.fhirService.uploadFhirRecord.calledOnce;
			done();
		});
	});

	it('uploadDocuments returns error when getUploadUserDocumentSAS fails ', (done) => {
		const uploadUserDocumentSASSFailureStub =
			sinon.stub(documentRoutes, 'getUploadUserDocumentToken')
				.returnsPromise().rejects('error');
		const azureUploadRoutesStub =
			sinon.stub(azureRoutes, 'uploadDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });
		const updateRecordStatusStub =
			sinon.stub(documentRoutes, 'updateRecordStatus')
				.returnsPromise().resolves({ content: 'fakeContent' });

		documentService.uploadDocument('k8hofmann', '9087').catch((err) => {
			expect(err).to.equal('error');
			expect(uploadUserDocumentSASSFailureStub).to.be.calledOnce;
			expect(azureUploadRoutesStub).to.be.not.called;
			expect(updateRecordStatusStub).to.be.not.called;
			done();
		});
	});


	afterEach(() => {

	});
});
