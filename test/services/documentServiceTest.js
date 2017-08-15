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

describe('arcturusAdapter', () => {
	let documentService;

	beforeEach(() => {
		documentService = new DocumentService('dummyZerokitadapter');
		documentService.zeroKitAdapter = {
			decrypt: sinon.stub().returnsPromise().resolves('decryptedDocument'),
			encrypt: sinon.stub().returnsPromise().resolves('encrypteddocument'),
		};
	});

	it('downloadDocument succeeds', (done) => {
		const getUserDocumentSASStub =
			sinon.stub(documentRoutes, 'getUserDocumentSAS')
				.returnsPromise().resolves({ sas_token: 'fakeSasToken' });
		const azureRoutesStub =
			sinon.stub(azureRoutes, 'downloadDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });

		documentService.downloadDocument('k8hofmann', '9087').then((res) => {
			expect(res).to.equal('decryptedDocument');
			expect(getUserDocumentSASStub).to.be.calledOnce;
			expect(azureRoutesStub).to.be.calledOnce;
			done();
		});
	});

	it('uploadDocument succeeds', (done) => {
		const uploadUserDocumentSASSuccessStub =
			sinon.stub(documentRoutes, 'getUploadUserDocumentSAS')
				.returnsPromise().resolves({ sas_token: 'fakeSasToken' });
		const azureUploadRoutesStub =
			sinon.stub(azureRoutes, 'uploadDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });
		const getChangeUserDocumentSASAtub =
			sinon.stub(documentRoutes, 'changeUserDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });

		documentService.uploadDocument('k8hofmann', '9087').then(() => {
			expect(uploadUserDocumentSASSuccessStub).to.be.calledOnce;
			expect(azureUploadRoutesStub).to.be.calledOnce;
			expect(azureUploadRoutesStub).to.be.calledWith('fakeSasToken', 'encrypteddocument');
			expect(getChangeUserDocumentSASAtub).to.be.calledOnce;
			documentRoutes.getUploadUserDocumentSAS.restore();
			azureRoutes.uploadDocument.restore();
			documentRoutes.changeUserDocument.restore();
			done();
		});
	});

	it('uploadDocuments returns error when getUploadUserDocumentSAS fails ', (done) => {
		const uploadUserDocumentSASSFailureStub =
			sinon.stub(documentRoutes, 'getUploadUserDocumentSAS')
				.returnsPromise().rejects('error');
		const azureUploadRoutesStub =
			sinon.stub(azureRoutes, 'uploadDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });
		const getChangeUserDocumentSASAtub =
			sinon.stub(documentRoutes, 'changeUserDocument')
				.returnsPromise().resolves({ content: 'fakeContent' });

		documentService.uploadDocument('k8hofmann', '9087').catch((err) => {
			expect(err).to.equal('error');
			expect(uploadUserDocumentSASSFailureStub).to.be.calledOnce;
			expect(azureUploadRoutesStub).to.be.not.called;
			expect(getChangeUserDocumentSASAtub).to.be.not.called;
			done();
		});
	});


	afterEach(() => {

	});
});
