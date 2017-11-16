/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import documentRoutes from '../../src/routes/documentRoutes';
import fileRoutes from '../../src/routes/fileRoutes';
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

	// stubs
	let zeroKitAdapter;
	let getFileDownloadUrlStub;
	let getFileUploadUrlsStub;
	let uploadFileStub;
	let downloadFileStub;
	let updateRecordStatusStub;

	beforeEach(() => {
		zeroKitAdapter = {
			decrypt: sinon.stub(),
			encrypt: sinon.stub().returnsPromise()
				.withArgs(file)
				.resolves(encryptedFile),
			decryptBlob: sinon.stub(),
			encryptBlob: sinon.stub().returnsPromise()
				.withArgs(file)
				.resolves(encryptedFile),
		};

		documentService = new DocumentService({ zeroKitAdapter });

		documentService.fhirService.createFhirRecord = sinon.stub()
			.returnsPromise().resolves(documentReferenceRecord);

		documentService.zeroKitAdapter.encrypt;

		getFileDownloadUrlStub =
			sinon.stub(documentRoutes, 'getFileDownloadUrl').returnsPromise();

		getFileUploadUrlsStub =
			sinon.stub(documentRoutes, 'getFileUploadUrls').returnsPromise();

		uploadFileStub = sinon.stub(fileRoutes, 'uploadFile').returnsPromise();

		downloadFileStub = sinon.stub(fileRoutes, 'downloadFile').returnsPromise();

		updateRecordStatusStub =
			sinon.stub(documentRoutes, 'updateRecordStatus').returnsPromise();
	});

	it('downloadDocument succeeds', (done) => {
		getFileDownloadUrlStub.resolves({ sas_token: sasToken });
		downloadFileStub.resolves({ content: encryptedFile });

		documentService.fhirService.downloadFhirRecord = sinon.stub()
			.returnsPromise().resolves(documentReferenceRecordFactory([encryptedFile]));

		documentService.zeroKitAdapter.decrypt = sinon.stub().returnsPromise().resolves(file);

		documentService.downloadDocument(userId, recordId).then((res) => {
			expect(downloadFileStub).to.be.calledOnce;
			expect(documentService.zeroKitAdapter.decryptBlob).to.be.calledOnce;
			expect(getFileDownloadUrlStub).to.be.calledOnce;
			expect(res).to.deep.equal(documentReferenceRecordFactory([attachmentContent]));
			done();
		});
	});

	it('uploadDocument succeeds', (done) => {
		const metadata = documentReferenceRecordFactory([]);

		getFileUploadUrlsStub.resolves([{ sas_token: sasToken }]);
		uploadFileStub.resolves({ content: encryptedFile });
		documentService.fhirService.updateFhirRecord =
			sinon.stub().returnsPromise()
				.resolves(documentReferenceRecordFactory([attachmentContent]));

		documentService.uploadDocument(userId, [attachmentContent], metadata.body).then(() => {
			expect(documentService.fhirService.createFhirRecord)
				.to.be.calledWith(metadata.body, ['type:document']);
			documentService.fhirService.createFhirRecord.calledOnce;
			documentService.fhirService.uploadFhirRecord.calledOnce;
			expect(getFileUploadUrlsStub).to.be.calledOnce;
			expect(uploadFileStub).to.be.calledOnce;
			expect(uploadFileStub).to.be.calledWith(sasToken, encryptedFile);
			expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
			done();
		});
	});

	it('uploadDocument returns error when getFileUploadUrls fails ', (done) => {
		getFileUploadUrlsStub.rejects('error');
		uploadFileStub.resolves();
		updateRecordStatusStub.resolves();

		documentService.uploadDocument(userId, [file]).catch((err) => {
			expect(err).to.equal('error');
			expect(getFileUploadUrlsStub).to.be.calledOnce;
			expect(uploadFileStub).to.be.not.called;
			expect(updateRecordStatusStub).to.be.not.called;
			done();
		});
	});

	it('updateDocumentMetadata passes when updateFhirRecord passes ', (done) => {
		documentService.fhirService.updateFhirRecord = sinon.stub()
			.returnsPromise().resolves('success');
		const jsonFhir = {
			author: [{
				reference: 'author',
			}],
			type: 'type',
			content: [],
		};

		documentService.updateDocumentMetadata('recordId', jsonFhir).then((res) => {
			expect(res).to.equal('success');
			expect(documentService.fhirService.updateFhirRecord).to.be.calledWith('recordId', {
				author: [{
					reference: 'author',
				}],
				type: 'type',
			});
			expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
			done();
		});
	});

	it('updateDocumentMetadata fails when updateFhirRecord fails ', (done) => {
		documentService.fhirService.updateFhirRecord = sinon.stub()
			.returnsPromise().rejects('error');

		const jsonFhir = {
			author: [{
				reference: 'author',
			}],
			type: 'type',
			content: [],
		};

		documentService.updateDocumentMetadata('recordId', jsonFhir).catch((err) => {
			expect(err).to.equal('error');
			expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
			done();
		});
	});

	it('updateDocumentMetadata returns error when getFileUploadUrls fails ', (done) => {
		documentService.fhirService.updateFhirRecord = sinon.stub()
			.returnsPromise().resolves('success');

		documentService.updateDocumentMetadata(userId, [file]).then((res) => {
			expect(res).to.equal('success');
			expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
			done();
		});
	});

	it('addFilesToDocument loads files up and adds them to the documentReference', (done) => {
		documentService.fhirService.downloadFhirRecord = sinon.stub()
			.returnsPromise().resolves(documentReferenceRecordFactory([attachmentContent]));

		getFileUploadUrlsStub.resolves([{ sas_token: sasToken, id: file }]);
		uploadFileStub.resolves({ content: encryptedFile });
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
		getFileDownloadUrlStub.restore();
		downloadFileStub.restore();
		getFileUploadUrlsStub.restore();
		uploadFileStub.restore();
		updateRecordStatusStub.restore();
	});
});
