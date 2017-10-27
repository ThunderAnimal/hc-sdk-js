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
	const userId = 'user_id';
	const recordId = 'record_id';
	const sasToken = 'sas_token';
	const encryptedFile = 'encrypted_file';
	const file = 'file';
	const attachmentContent = { data: file, title: 'file' };

	const emptyDocumentReference = {
		description: 'Title',
		indexed: '2017-10-18T13:58:12.809Z',
		resourceType: 'DocumentReference',
		status: 'current',
		type: { text: 'concept' },
	};

	const documentReferenceRecord = {
		record_id: recordId,
		date: '2017-09-19',
		user_id: userId,
		body: emptyDocumentReference,
		tags: ['tag1', 'tag2'],
		version: 1,
		status: 'Active',
		createdAt: '2017-09-19T09:29:48.278',
	};

	const documentReferenceRecordFactory = (files = [], basicRecord = documentReferenceRecord) => {
		const content = files.map(() => ({ attachment: attachmentContent }));
		basicRecord.body.content = content;
		basicRecord.files = files;
		return basicRecord;
	};

	beforeEach(() => {
		const zeroKitAdapter = {
			decrypt: sinon.stub(),
			encrypt: sinon.stub(),
		};

		documentService = new DocumentService({ zeroKitAdapter });

		documentService.fhirService.createFhirRecord = sinon.stub()
			.returnsPromise().resolves(documentReferenceRecord);

		documentService.zeroKitAdapter.encrypt.returnsPromise().withArgs(file)
			.resolves(encryptedFile);
	});

	it('downloadDocument succeeds', (done) => {
		const getUserDocumentSASStub =
			sinon.stub(documentRoutes, 'getFileDownloadUrl')
				.returnsPromise().resolves({ sas_token: sasToken });
		const azureRoutesStub =
			sinon.stub(azureRoutes, 'downloadFile')
				.returnsPromise().resolves({ content: encryptedFile });

		documentService.fhirService.downloadFhirRecord = sinon.stub()
			.returnsPromise().resolves(documentReferenceRecordFactory([encryptedFile]));

		documentService.zeroKitAdapter.decrypt = sinon.stub().returnsPromise().resolves(file);

		documentService.downloadDocument(userId, recordId).then((res) => {
			expect(azureRoutesStub).to.be.calledOnce;
			expect(documentService.zeroKitAdapter.decrypt).to.be.calledOnce;
			expect(getUserDocumentSASStub).to.be.calledOnce;
			expect(res).to.deep.equal(documentReferenceRecordFactory([attachmentContent]));
			done();
		});
	});

	it('uploadDocument succeeds', (done) => {
		const metadata = documentReferenceRecordFactory([]);

		const getFileUploadUrlsStub =
			sinon.stub(documentRoutes, 'getFileUploadUrls')
				.returnsPromise().resolves([{ sas_token: sasToken }]);
		const uploadFileStub =
			sinon.stub(azureRoutes, 'uploadFile')
				.returnsPromise().resolves({ content: encryptedFile });
		documentService.fhirService.updateFhirRecord =
			sinon.stub().returnsPromise()
				.resolves(documentReferenceRecordFactory([attachmentContent]));

		documentService.uploadDocument(userId, [attachmentContent], metadata.body).then(() => {
			documentService.fhirService.uploadFhirRecord.calledOnce;
			expect(getFileUploadUrlsStub).to.be.calledOnce;
			expect(uploadFileStub).to.be.calledOnce;
			expect(uploadFileStub).to.be.calledWith(sasToken, encryptedFile);
			expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
			documentRoutes.getFileUploadUrls.restore();
			azureRoutes.uploadFile.restore();
			done();
		});
	});

	it('uploadDocument returns error when getFileUploadUrls fails ', (done) => {
		const getFileUploadUrlsStub =
			sinon.stub(documentRoutes, 'getFileUploadUrls')
				.returnsPromise().rejects('error');
		const azureUploadRoutesStub =
			sinon.stub(azureRoutes, 'uploadFile')
				.returnsPromise();
		const updateRecordStatusStub =
			sinon.stub(documentRoutes, 'updateRecordStatus')
				.returnsPromise();

		documentService.uploadDocument(userId, [file]).catch((err) => {
			expect(err).to.equal('error');
			expect(getFileUploadUrlsStub).to.be.calledOnce;
			expect(azureUploadRoutesStub).to.be.not.called;
			expect(updateRecordStatusStub).to.be.not.called;
			documentRoutes.getFileUploadUrls.restore();
			azureRoutes.uploadFile.restore();
			done();
		});
	});

	it('addFilesToDocument loads files up and adds them to the documentReference', (done) => {
		documentService.fhirService.downloadFhirRecord = sinon.stub()
			.returnsPromise().resolves(documentReferenceRecordFactory([attachmentContent]));
		const getFileUploadUrlsStub =
			sinon.stub(documentRoutes, 'getFileUploadUrls')
				.returnsPromise().resolves([{ sas_token: sasToken, id: file }]);
		const uploadFileStub =
			sinon.stub(azureRoutes, 'uploadFile')
				.returnsPromise().resolves({ content: encryptedFile });
		documentService.fhirService.updateFhirRecord =
			sinon.stub().returnsPromise()
				.resolves(documentReferenceRecordFactory([file, file]).body);

		documentService.addFilesToDocument(userId, recordId, [attachmentContent]).then((res) => {
			expect(getFileUploadUrlsStub).to.be.calledOnce;
			expect(uploadFileStub).to.be.calledOnce;
			expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
			expect(documentService.fhirService.updateFhirRecord).to.be
				.calledWith(recordId, documentReferenceRecordFactory([file, file]).body);
			expect(res).to.deep.equal(documentReferenceRecordFactory([file, file]).body);

			done();
		});
	});

	it('deleteFilesFromDocument removes attachments from documentResource', (done) => {
		documentService.fhirService.downloadFhirRecord = sinon.stub()
			.returnsPromise().resolves(documentReferenceRecordFactory([file]));
		documentService.fhirService.updateFhirRecord =
			sinon.stub().returnsPromise()
				.resolves(documentReferenceRecordFactory().body);

		documentService.deleteFilesFromDocument(userId, recordId, [file]).then((res) => {
			expect(documentService.fhirService.updateFhirRecord).to.be
				.calledWith(recordId, documentReferenceRecordFactory([]).body);
			done();
		});
	});


	afterEach(() => {

	});
});
