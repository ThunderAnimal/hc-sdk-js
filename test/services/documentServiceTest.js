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
import hcDocumentUtils from '../../src/lib/models/utils/hcDocumentUtils';
import testVariables from '../../test/testUtils/testVariables';
import recordResources from '../../test/testUtils/recordResources';
import taggingUtils from '../../src/lib/taggingUtils';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('DocumentService', () => {
    let getFileUploadUrlsStub;
    let getFileDownloadUrlStub;

    let fromFhirObjectStub;
    let toFhirObjectStub;
    let isValidStub;

    let uploadFileStub;
    let downloadFileStub;

    let updateRecordStatusStub;

    let decryptStub;
    let encryptStub;
    let decryptBlobStub;
    let encryptBlobStub;

    let zeroKitAdapter;

    const file = {
        name: 'file',
        lastModifiedDate: new Date('Mon Nov 20 2017 12:58:01 GMT+0100 (CET)'),
    };
    const userId = 'user_id';
    const date = new Date('Thu, 23 Nov 2017 22:57:55 GMT');
    const title = 'title';
    const type = 'type';
    const author = 'Glumli';
    const fileId = 'fileId';
    const fhirObject = { resourceType: 'documentReference' };
    const recordId = 'record_id';

    const attachmentWithoutFile = {
        author,
        title,
        type,
    };
    const attachmentWithFile = JSON.parse(JSON.stringify(attachmentWithoutFile));
    attachmentWithFile.file = file;

    const hcDocumentWithoutFileData = {
        author,
        type,
        id: recordId,
        creationDate: date,
        title,
        attachments: [attachmentWithoutFile],
    };

    const hcDocumentWithFileData = JSON.parse(JSON.stringify(hcDocumentWithoutFileData));
    hcDocumentWithFileData.attachments = [attachmentWithFile];
    hcDocumentWithFileData.toFhirObject = sinon.stub().returns(fhirObject);
    hcDocumentWithFileData.creationDate = date;

    let documentService;
    const sasToken = 'sas_token';
    const encryptedFile = 'encrypted_file';

    const attachmentContent = {
        data: file,
        title: file.name,
        id: 'id',
        creation: file.lastModifiedDate,
    };

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
        // stubs
        getFileUploadUrlsStub = sinon.stub(documentRoutes, 'getFileUploadUrls').returnsPromise();
        getFileDownloadUrlStub = sinon.stub(documentRoutes, 'getFileDownloadUrl').returnsPromise();

        fromFhirObjectStub = sinon.stub(hcDocumentUtils, 'fromFhirObject');
        toFhirObjectStub = sinon.stub(hcDocumentUtils, 'toFhirObject');
        isValidStub = sinon.stub(hcDocumentUtils, 'isValid').returns(true);

        uploadFileStub = sinon.stub(fileRoutes, 'uploadFile').returnsPromise();
        downloadFileStub = sinon.stub(fileRoutes, 'downloadFile').returnsPromise();

        updateRecordStatusStub = sinon.stub(documentRoutes, 'updateRecordStatus').returnsPromise();

        decryptStub = sinon.stub().returnsPromise().resolves();
        encryptStub = sinon.stub().returnsPromise().withArgs(file)
            .resolves(encryptedFile);
        decryptBlobStub = sinon.stub().returnsPromise().resolves(file);
        encryptBlobStub = sinon.stub().returnsPromise().withArgs(file)
            .resolves(encryptedFile);

        zeroKitAdapter = {
            decrypt: decryptStub,
            encrypt: encryptStub,
            decryptBlob: decryptBlobStub,
            encryptBlob: encryptBlobStub,
        };

        documentService = new DocumentService({ zeroKitAdapter });
        documentService.fhirService.createFhirRecord = sinon.stub()
            .returnsPromise().resolves(documentReferenceRecord);
        documentService.fhirService.downloadFhirRecord = sinon.stub()
            .returnsPromise().resolves(documentReferenceRecordFactory([encryptedFile]));
        documentService.fhirService.updateFhirRecord = sinon.stub()
            .returnsPromise().resolves({ record_id: recordId });
        documentService.fhirService.searchRecords = sinon.stub()
            .returnsPromise().withArgs(testVariables.userId, { tags: [taggingUtils.buildTag('resourceType', 'documentReference')] })
            .resolves({ totalCount: 1, records: [recordResources.documentReference] });
    });

    it('uploadDocument - Happy Path', (done) => {
        getFileUploadUrlsStub.resolves([{ sas_token: sasToken, id: fileId }]);
        uploadFileStub.resolves(['']);
        toFhirObjectStub.returns(fhirObject);

        documentService.uploadDocument(userId, hcDocumentWithFileData)
            .then(() => {
                expect(documentService.fhirService.createFhirRecord).to.be.calledOnce;
                expect(zeroKitAdapter.encryptBlob).to.be.calledOnce;
                expect(zeroKitAdapter.encryptBlob).to.be.calledWith(userId, file);
                expect(getFileUploadUrlsStub).to.be.calledOnce;
                expect(uploadFileStub).to.be.calledOnce;
                expect(uploadFileStub).to.be.calledWith(sasToken, encryptedFile);
                expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
                expect(documentService.fhirService.updateFhirRecord)
                    .to.be.calledWith(userId, recordId, fhirObject);
                done();
            });
    });

    it('downloadDocument - Happy Path', (done) => {
        attachmentWithoutFile.id = fileId;
        attachmentWithFile.id = fileId;
        fromFhirObjectStub.returns(hcDocumentWithoutFileData);
        getFileDownloadUrlStub.resolves({ sas_token: sasToken });
        downloadFileStub.resolves(encryptedFile);

        documentService.downloadDocument(userId, recordId).then((hcDocument) => {
            expect(decryptBlobStub).to.be.calledOnce;
            expect(documentService.fhirService.downloadFhirRecord).to.be.calledOnce;
            expect(downloadFileStub).to.be.calledOnce;
            expect(hcDocument.id).to.equal(recordId);

            attachmentWithoutFile.id = undefined;
            attachmentWithFile.id = undefined;
            done();
        });
    });

    it('uploadDocument - rejects when getFileUploadUrls fails ', (done) => {
        getFileUploadUrlsStub.rejects('error');
        uploadFileStub.resolves();
        updateRecordStatusStub.resolves();

        documentService.uploadDocument(userId, hcDocumentWithFileData).catch((err) => {
            expect(err).to.equal('error');
            expect(getFileUploadUrlsStub).to.be.calledOnce;
            expect(uploadFileStub).to.be.not.called;
            expect(updateRecordStatusStub).to.be.not.called;
            done();
        });
    });

    it('updateDocument - Happy Path with no changes', (done) => {
        documentService.fhirService.updateFhirRecord = sinon.stub()
            .returnsPromise().resolves(fhirObject);
        attachmentWithoutFile.id = fileId;
        toFhirObjectStub.returns(fhirObject);

        documentService.updateDocument(userId, hcDocumentWithoutFileData).then((res) => {
            expect(documentService.zeroKitAdapter.encryptBlob).to.be.not.called;
            expect(getFileUploadUrlsStub).to.be.not.called;
            expect(uploadFileStub).to.be.not.called;
            expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
            expect(documentService.fhirService.updateFhirRecord)
                .to.be.calledWith(userId, recordId, fhirObject);

            attachmentWithoutFile.id = undefined;
            done();
        });
    });

    it('updateDocument - fails when getFileUploadUrls fails ', (done) => {
        getFileUploadUrlsStub.rejects('error');
        documentService.updateDocument(userId, hcDocumentWithFileData).catch((err) => {
            expect(err).to.equal('error');
            expect(getFileUploadUrlsStub).to.be.calledOnce;
            expect(uploadFileStub).to.be.not.called;
            expect(updateRecordStatusStub).to.be.not.called;
            done();
        });
    });


    describe('getDocuments', () => {
        it('should pass', (done) => {
            fromFhirObjectStub.returns(hcDocumentWithoutFileData);
            documentService.getDocuments(testVariables.userId).then((result) => {
                expect(result.records[0]).to.equal(hcDocumentWithoutFileData);
                expect(result.totalCount).to.equal(1);
                expect(fromFhirObjectStub).to.be.calledOnce;
                done();
            }).catch(done);
        });

        it('should fail if searchrecords return error', (done) => {
            fromFhirObjectStub.returns(hcDocumentWithoutFileData);
            documentService.fhirService.searchRecords = sinon.stub().returnsPromise().rejects('error');
            documentService.getDocuments(testVariables.secondUserId)
                .catch((err) => {
                    expect(err).to.equal('error');
                    expect(fromFhirObjectStub).to.not.be.called;
                    done();
                });
        });
    });

    describe('getDocumentsCount', () => {
        it('should pass', (done) => {
            documentService.fhirService.searchRecords = sinon.stub()
                .returnsPromise()
                .withArgs(testVariables.userId, { tags: [taggingUtils.buildTag('resourceType', 'documentReference')] }, true)
                .resolves({ totalCount: 1 });

            documentService.getDocumentsCount(testVariables.userId).then((result) => {
                expect(result.records).to.be.undefined;
                expect(result.totalCount).to.equal(1);
                expect(fromFhirObjectStub).to.not.be.called;
                done();
            }).catch(done);
        });

        it('should fail if searchrecords return error', (done) => {
            fromFhirObjectStub.returns(hcDocumentWithoutFileData);
            documentService.fhirService.searchRecords = sinon.stub().returnsPromise().rejects('error');
            documentService.getDocuments(testVariables.secondUserId)
                .then(() => done(Error('getDocumentsCount rejection didn\'t work properly in documentService.loginNode')))
                .catch((err) => {
                    expect(err).to.equal('error');
                    expect(fromFhirObjectStub).to.not.be.called;
                    done();
                });
        });
    });


    afterEach(() => {
        getFileDownloadUrlStub.restore();
        downloadFileStub.restore();
        getFileUploadUrlsStub.restore();
        fromFhirObjectStub.restore();
        toFhirObjectStub.restore();
        isValidStub.restore();
        uploadFileStub.restore();
        updateRecordStatusStub.restore();
        encryptBlobStub.resetHistory();
    });
});
