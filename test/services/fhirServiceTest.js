/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';

import '../../src/routes/documentRoutes';
import '../../src/services/fhirService';
import '../../src/services/userService';
import '../../src/lib/fhirValidator';
import '../../src/lib/crypto';
import taggingUtils from '../../src/lib/taggingUtils';


import testVariables from '../testUtils/testVariables';
import userResources from '../testUtils/userResources';
import fhirResources from '../testUtils/fhirResources';
import recordResources from '../testUtils/recordResources';
import documentResources from '../testUtils/documentResources';
import encryptionResources from '../testUtils/encryptionResources';


const proxyquire = proxy(require);
sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('services/fhirService', () => {
    let fhirService;
    let encryptionServiceStub;

    let encryptObjectStub;
    let symEncryptStringStub;
    let symDecryptStringStub;
    let symEncryptObjectStub;
    let convertBase64ToArrayBufferViewStub;
    let convertArrayBufferViewToStringStub;

    let createRecordStub;
    let decryptDataStub;
    let deleteRecordStub;
    let downloadRecordStub;
    let fhirServiceUploadRecordSpy;

    let getUserStub;
    let searchRecordsStub;
    let getRecordsCountStub;
    let updateRecordStub;
    let validateStub;

    beforeEach(() => {
        encryptObjectStub = sinon.stub()
            .returnsPromise().resolves(encryptionResources.encryptedObject);

        decryptDataStub = sinon.stub().returnsPromise().resolves(encryptionResources.data);
        symEncryptStringStub = sinon.stub()
            .returnsPromise().resolves(encryptionResources.encryptedString);
        symDecryptStringStub = sinon.stub()
            .returnsPromise().resolves(encryptionResources.string);
        symEncryptObjectStub = sinon.stub()
            .returnsPromise().resolves(encryptionResources.string);
        convertBase64ToArrayBufferViewStub = sinon.stub()
            .returns(encryptionResources.data);
        convertArrayBufferViewToStringStub = sinon.stub()
            .returns(JSON.stringify(fhirResources.documentReference));

        getUserStub = sinon.stub()
            .returnsPromise().resolves(userResources.cryptoUser);

        createRecordStub = sinon.stub()
            .returnsPromise().resolves(Object.assign({}, recordResources.documentReference));
        deleteRecordStub = sinon.stub()
            .returnsPromise().resolves();
        downloadRecordStub = sinon.stub()
            .returnsPromise().resolves(
                Object.assign({}, recordResources.documentReferenceEncrypted));
        getRecordsCountStub = sinon.stub()
            .returnsPromise().resolves({
                totalCount: recordResources.count,
            });
        searchRecordsStub = sinon.stub()
            .returnsPromise().resolves({
                totalCount: recordResources.count,
                records: [Object.assign({}, recordResources.documentReferenceEncrypted)],
            });
        updateRecordStub = sinon.stub()
            .returnsPromise().resolves(Object.assign({}, recordResources.documentReference));

        validateStub = sinon.stub()
            .returnsPromise().resolves();

        encryptionServiceStub = sinon.stub().returns({
            decryptData: decryptDataStub,
            encryptObject: encryptObjectStub,
        });
        fhirService = proxyquire('../../src/services/fhirService', {
            './cryptoService': {
                default: encryptionServiceStub,
            },
            './userService': {
                default: {
                    getUser: getUserStub,
                },
            },
            '../routes/documentRoutes': {
                default: {
                    updateRecord: updateRecordStub,
                    searchRecords: searchRecordsStub,
                    getRecordsCount: getRecordsCountStub,
                    createRecord: createRecordStub,
                    deleteRecord: deleteRecordStub,
                    downloadRecord: downloadRecordStub,
                },
            },
            '../lib/fhirValidator': {
                default: { validate: validateStub },
            },
            '../lib/crypto': {
                default: {
                    symEncryptString: symEncryptStringStub,
                    symEncryptObject: symEncryptObjectStub,
                    symDecryptString: symDecryptStringStub,
                    convertBase64ToArrayBufferView: convertBase64ToArrayBufferViewStub,
                    convertArrayBufferViewToString: convertArrayBufferViewToStringStub,
                },
            },
            '../lib/taggingUtils': {
                default: {
                    clientId: testVariables.clientId,
                    generateTags: taggingUtils.generateTags,
                    buildTag: taggingUtils.buildTag,
                },
            },
        }).default;

        fhirServiceUploadRecordSpy = sinon.spy(fhirService, 'uploadRecord');
    });

    describe('createFhirRecord', () => {
        it('should resolve when called with userId and correct fhirResource', (done) => {
            fhirService.createFhirRecord(testVariables.userId, fhirResources.documentReference)
                .then(() => {
                    expect(createRecordStub).to.be.calledOnce;
                    expect(createRecordStub).to.be.calledWith(testVariables.userId);
                    expect(validateStub).to.be.calledOnce;
                    expect(validateStub).to.be.calledWith(fhirResources.documentReference);
                    expect(getUserStub).to.be.calledOnce;
                    expect(getUserStub).to.be.calledWith(testVariables.userId);
                    done();
                })
                .catch(done);
        });

        it('fails when fhirValidation fails', (done) => {
            validateStub.rejects();

            fhirService.uploadFhirRecord(testVariables.userId, fhirResources.documentReference)
                .then(() => done(Error('fhirValidation didn\'t fail as expected')))
                .catch(() => {
                    expect(validateStub).to.be.calledOnce;
                    expect(createRecordStub).to.not.be.called;
                    done();
                });
        });
    });

    describe('updateFhirRecord', () => {
        it('should resolve when called with userId, recordId and fhirResource ', (done) => {
            fhirService.updateFhirRecord(
                testVariables.userId,
                testVariables.recordId,
                fhirResources.documentReference)
                .then((res) => {
                    expect(res.id).to.deep.equal(testVariables.id);
                    expect(updateRecordStub).to.be.calledOnce;
                    expect(getUserStub).to.be.calledTwice;
                    expect(getUserStub).to.be.calledWith(testVariables.userId);
                    done();
                })
                .catch(done);
        });

        it('should pass the right custom tags corresponding to the annotations passed', (done) => {
            const tags = [
                ...taggingUtils.generateCustomTags(documentResources.annotations),
                ...taggingUtils.generateTags(fhirResources.documentReference),
            ];
            fhirService.updateFhirRecord(
                testVariables.userId,
                testVariables.recordId,
                fhirResources.documentReference,
                taggingUtils.generateCustomTags(documentResources.annotations),
            )
                .then((res) => {
                    expect(res.id).to.deep.equal(testVariables.id);
                    expect(updateRecordStub).to.be.calledOnce;
                    expect(fhirServiceUploadRecordSpy).to.be.calledWith(
                        testVariables.userId,
                        fhirResources.documentReference,
                    );
                    expect(fhirServiceUploadRecordSpy.firstCall.args[3].toString())
                        .to.equal(tags.toString());

                    done();
                })
                .catch(done);
        });
    });

    describe('downloadFhirRecord', () => {
        it('should resolve to Record, when called wit userId and recordId', (done) => {
            fhirService.downloadFhirRecord(testVariables.userId, testVariables.recordId)
                .then((res) => {
                    expect(res.body).to.deep.equal(fhirResources.documentReference);
                    expect(downloadRecordStub).to.be.calledOnce;
                    expect(downloadRecordStub).to.be.calledWith(testVariables.userId);
                    expect(getUserStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
        });
    });

    describe('searchRecords', () => {
        it('works as expected with all parameters', (done) => {
            const params = {
                client_id: testVariables.clientId,
                limit: 20,
                offset: 20,
                start_date: '2017-06-06',
                end_date: '2017-08-08',
                tags: [testVariables.tag, testVariables.secondTag],
            };

            const expectedParamsForRoute = {
                limit: 20,
                offset: 20,
                start_date: '2017-06-06',
                end_date: '2017-08-08',
                tags: `${encryptionResources.encryptedString},${encryptionResources.encryptedString},${encryptionResources.encryptedString}`,
            };

            fhirService.searchRecords(testVariables.userId, params)
                .then((res) => {
                    expect(res.records.length).to.equal(1);
                    expect(res.totalCount).to.equal(recordResources.count);
                    expect(res.records[0].record_id).to.equal(testVariables.recordId);
                    expect(searchRecordsStub).to.be.calledOnce;
                    expect(searchRecordsStub).to.be.calledWith(testVariables.userId,
                        expectedParamsForRoute);
                    expect(getUserStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
        });

        it('returns only count when one of params is countOnly', (done) => {
            const params = {
                client_id: testVariables.clientId,
            };

            const expectedParamsForRoute = {
                tags: `${encryptionResources.encryptedString}`,
            };

            fhirService.searchRecords(testVariables.userId, params, true)
                .then((res) => {
                    expect(res.totalCount).to.equal(recordResources.count);
                    expect(getRecordsCountStub).to.be.calledOnce;
                    expect(getRecordsCountStub).to.be.calledWith(testVariables.userId,
                        expectedParamsForRoute);
                    expect(getUserStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
        });

        it('parses the clientId as a tag', (done) => {
            const params = {
                client_id: testVariables.clientId,
            };

            const expectedParamsForRoute = {
                tags: `${encryptionResources.encryptedString}`,
            };

            fhirService.searchRecords(testVariables.userId, params)
                .then((res) => {
                    expect(res.records.length).to.equal(1);
                    expect(res.records[0].record_id).to.equal(testVariables.recordId);
                    expect(searchRecordsStub).to.be.calledOnce;
                    expect(searchRecordsStub).to.be.calledWith(testVariables.userId,
                        expectedParamsForRoute);
                    expect(getUserStub).to.be.calledOnce;
                    done();
                })
                .catch(done);
        });
    });

    describe('deleteRecord', () => {
        it('should resolve, when called with userId and recordId', (done) => {
            fhirService.deleteRecord(testVariables.userId, testVariables.recordId)
                .then(() => {
                    expect(deleteRecordStub).to.be.calledOnce;
                    expect(deleteRecordStub).to.be
                        .calledWith(testVariables.userId, testVariables.recordId);
                    done();
                })
                .catch(done);
        });
    });

    afterEach(() => {});
});
