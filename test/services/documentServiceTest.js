/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import proxy from 'proxyquireify';
import sinonChai from 'sinon-chai';
import '../../src/routes/documentRoutes';
import '../../src/routes/fileRoutes';
import '../../src/services/documentService';
import '../../src/lib/models/utils/hcDocumentUtils';
import testVariables from '../../test/testUtils/testVariables';
import recordResources from '../../test/testUtils/recordResources';
import taggingUtils from '../../src/lib/taggingUtils';
import encryptionResources from '../testUtils/encryptionResources';
import '../../src/lib/crypto';
import '../../src/services/cryptoService';

const proxyquire = proxy(require);
sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('documentService', () => {
    let documentService;
    let getFileUploadUrlsStub;
    let getFileDownloadUrlStub;
    let fetchAttachmentKeyStub;

    let fromFhirObjectStub;
    let toFhirObjectStub;
    let isValidStub;

    let uploadFileStub;
    let downloadFileStub;

    let updateRecordStatusStub;

    let convertBlobToArrayBufferViewStub;

    let decryptDataStub;
    let encryptBlobsStub;

    let encryptionServiceStub;

    let createFhirRecordStub;
    let downloadFhirRecordStub;
    let updateFhirRecordStub;
    let searchRecordsStub;

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
        decryptDataStub = sinon.stub().returnsPromise().resolves();
        encryptBlobsStub = sinon.stub().returnsPromise().withArgs(file)
            .resolves([[encryptedFile]], encryptionResources.encryptedDataKey);

        encryptionServiceStub = sinon.stub().returns({
            decryptData: decryptDataStub,
            encryptBlobs: encryptBlobsStub,
        });

        getFileUploadUrlsStub = sinon.stub().returnsPromise();
        getFileDownloadUrlStub = sinon.stub().returnsPromise();
        fetchAttachmentKeyStub = sinon.stub().returnsPromise()
            .resolves(encryptionResources.encryptedAttachmentKey);
        updateRecordStatusStub = sinon.stub().returnsPromise();

        uploadFileStub = sinon.stub().returnsPromise();
        downloadFileStub = sinon.stub().returnsPromise();

        convertBlobToArrayBufferViewStub = sinon.stub()
            .returnsPromise().resolves(encryptionResources.file);


        fromFhirObjectStub = sinon.stub();
        toFhirObjectStub = sinon.stub();
        isValidStub = sinon.stub().returns(true);

        documentService = proxyquire('../../src/services/documentService', {
            './cryptoService': {
                default: encryptionServiceStub,
            },
            '../routes/documentRoutes': {
                default: {
                    getFileUploadUrls: getFileUploadUrlsStub,
                    getFileDownloadUrl: getFileDownloadUrlStub,
                    fetchAttachmentKey: fetchAttachmentKeyStub,
                    updateRecordStatus: updateRecordStatusStub,
                },
            },
            '../routes/fileRoutes': {
                default: {
                    uploadFile: uploadFileStub,
                    downloadFile: downloadFileStub,
                },
            },
            '../lib/crypto': {
                default: {
                    convertBlobToArrayBufferView: convertBlobToArrayBufferViewStub,
                },
            },
            '../lib/models/utils/hcDocumentUtils': {
                default: {
                    fromFhirObject: fromFhirObjectStub,
                    toFhirObject: toFhirObjectStub,
                    isValid: isValidStub,
                },
            },
        }).default;

        // stubs


        createFhirRecordStub = sinon.stub()
            .returnsPromise().resolves(documentReferenceRecord);
        downloadFhirRecordStub = sinon.stub()
            .returnsPromise().resolves(documentReferenceRecordFactory([encryptedFile]));
        updateFhirRecordStub = sinon.stub()
            .returnsPromise().resolves({ record_id: recordId });
        searchRecordsStub = sinon.stub()
            .returnsPromise().withArgs(testVariables.userId, { tags: [taggingUtils.buildTag('resourceType', 'documentReference')] })
            .resolves({ totalCount: 1, records: [recordResources.documentReference] });

        documentService.fhirService = {
            createFhirRecord: createFhirRecordStub,
            downloadFhirRecord: downloadFhirRecordStub,
            updateFhirRecord: updateFhirRecordStub,
            searchRecords: searchRecordsStub,
        };
    });

    describe('uploadDocument', () => {
        let doc;
        beforeEach(() => {
            doc = JSON.parse(JSON.stringify(hcDocumentWithFileData));
        });

        it('rejects when getFileUploadUrls fails ', (done) => {
            getFileUploadUrlsStub.rejects('error');
            uploadFileStub.resolves();
            updateRecordStatusStub.resolves();

            documentService.uploadDocument(userId, doc)
                .then(() => done(Error('uploadDocument rejection didn\'t work properly')))
                .catch((err) => {
                    expect(err).to.equal('error');
                    expect(getFileUploadUrlsStub).to.be.calledOnce;
                    expect(uploadFileStub).to.be.not.called;
                    expect(updateRecordStatusStub).to.be.not.called;
                    done();
                })
                .catch(done);
        });

        it('should resolve, when called with correct hcDocument with files', (done) => {
            getFileUploadUrlsStub.resolves([{ sas_token: sasToken, id: fileId }]);
            uploadFileStub.resolves(['']);
            toFhirObjectStub.returns(fhirObject);

            documentService.uploadDocument(userId, hcDocumentWithFileData)
                .then(() => {
                    expect(documentService.fhirService.createFhirRecord).to.be.calledOnce;
                    expect(encryptBlobsStub).to.be.calledOnce;
                    expect(encryptBlobsStub).to.be.calledWith([file]);
                    expect(getFileUploadUrlsStub).to.be.calledOnce;
                    expect(uploadFileStub).to.be.calledOnce;
                    expect(uploadFileStub).to.be.calledWith(sasToken, encryptedFile);
                    expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
                    expect(documentService.fhirService.updateFhirRecord)
                        .to.be.calledWith(userId, recordId, fhirObject);
                    done();
                })
                .catch(done);
        });
    });


    describe('downloadDocument', () => {
        it('should resolve to a correct hcDocument with files', (done) => {
            attachmentWithoutFile.id = fileId;
            attachmentWithFile.id = fileId;
            fromFhirObjectStub.returns(hcDocumentWithoutFileData);
            getFileDownloadUrlStub.resolves({ sas_token: sasToken });
            downloadFileStub.resolves(encryptedFile);

            documentService.downloadDocument(userId, recordId)
                .then((hcDocument) => {
                    expect(decryptDataStub).to.be.calledOnce;
                    expect(documentService.fhirService.downloadFhirRecord).to.be.calledOnce;
                    expect(downloadFileStub).to.be.calledOnce;
                    expect(hcDocument.id).to.equal(recordId);

                    attachmentWithoutFile.id = undefined;
                    attachmentWithFile.id = undefined;
                    done();
                })
                .catch(done);
        });
    });

    describe('updateDocument', () => {
        it('should resolve, when document is not changed', (done) => {
            documentService.fhirService.updateFhirRecord = sinon.stub()
                .returnsPromise().resolves(fhirObject);
            attachmentWithoutFile.id = fileId;
            toFhirObjectStub.returns(fhirObject);
            encryptBlobsStub.resolves([[], encryptionResources.encryptedAttachmentKey]);

            documentService.updateDocument(userId, hcDocumentWithoutFileData)
                .then(() => {
                    expect(encryptBlobsStub).to.be.calledWith([]);
                    expect(getFileUploadUrlsStub).to.be.not.called;
                    expect(uploadFileStub).to.be.not.called;
                    expect(documentService.fhirService.updateFhirRecord).to.be.calledOnce;
                    expect(documentService.fhirService.updateFhirRecord)
                        .to.be.calledWith(userId, recordId, fhirObject);

                    attachmentWithoutFile.id = undefined;
                    done();
                })
                .catch(done);
        });

        it('fails when getFileUploadUrls fails ', (done) => {
            getFileUploadUrlsStub.rejects('error');
            documentService.updateDocument(userId, hcDocumentWithFileData)
                .catch((err) => {
                    expect(err).to.equal('error');
                    expect(getFileUploadUrlsStub).to.be.calledOnce;
                    expect(uploadFileStub).to.be.not.called;
                    expect(updateRecordStatusStub).to.be.not.called;
                    done();
                });
        });
    });


    describe('getDocuments', () => {
        it('should pass', (done) => {
            fromFhirObjectStub.returns(hcDocumentWithoutFileData);
            documentService.getDocuments(testVariables.userId)
                .then((result) => {
                    expect(result.records[0]).to.equal(hcDocumentWithoutFileData);
                    expect(result.totalCount).to.equal(1);
                    expect(fromFhirObjectStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
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


    afterEach(() => {});
});
