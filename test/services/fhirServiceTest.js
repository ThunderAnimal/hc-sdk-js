/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';

import documentRoutes from '../../src/routes/documentRoutes';
import fhirService from '../../src/services/fhirService';
import userService from '../../src/services/userService';
import encryptionUtils from '../../src/lib/EncryptionUtils';
import fhirValidator from '../../src/lib/fhirValidator';
import taggingUtils from '../../src/lib/taggingUtils';


import testVariables from '../testUtils/testVariables';
import userResources from '../testUtils/userResources';
import fhirResources from '../testUtils/fhirResources';
import recordResources from '../testUtils/recordResources';
import encryptionResources from '../testUtils/encryptionResources';
import crypto from '../../src/lib/crypto';


sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('services/fhirService', () => {
    let encryptionServiceStub;

    let encryptObjectStub;

    let symEncryptStringStub;
    let symDecryptStringStub;
    let convertBase64ToArrayBufferViewStub;
    let convertArrayBufferViewToStringStub;

    let createRecordStub;
    let decryptDataStub;
    let deleteRecordStub;
    let downloadRecordStub;
    let generateTagsFromFhirObjectStub;
    let getInternalUserStub;
    let searchRecordsStub;
    let getRecordsCountStub;
    let tagDecryptStub;
    let updateRecordStub;
    let validateStub;

    beforeEach(() => {
        encryptObjectStub = sinon.stub()
            .returnsPromise().resolves(encryptionResources.encryptedObject);
        decryptDataStub = sinon.stub().returnsPromise().resolves(encryptionResources.data);
        symEncryptStringStub = sinon.stub(crypto, 'symEncryptString')
            .returnsPromise().resolves(encryptionResources.encryptedString);
        symDecryptStringStub = sinon.stub(crypto, 'symDecryptString')
            .returnsPromise().resolves(encryptionResources.string);
        convertBase64ToArrayBufferViewStub = sinon.stub(crypto, 'convertBase64ToArrayBufferView')
            .returns(encryptionResources.data);
        convertArrayBufferViewToStringStub = sinon.stub(crypto, 'convertArrayBufferViewToString')
            .returns(JSON.stringify(fhirResources.documentReference));
        createRecordStub = sinon.stub(documentRoutes, 'createRecord')
            .returnsPromise().resolves(Object.assign({}, recordResources.documentReference));
        deleteRecordStub = sinon.stub(documentRoutes, 'deleteRecord')
            .returnsPromise().resolves();
        downloadRecordStub = sinon.stub(documentRoutes, 'downloadRecord')
            .returnsPromise().resolves(
                Object.assign({}, recordResources.documentReferenceEncrypted));
        generateTagsFromFhirObjectStub = sinon.stub(taggingUtils, 'generateTagsFromFhirObject')
            .returns([testVariables.tag]);
        getInternalUserStub = sinon.stub(userService, 'getInternalUser')
            .returnsPromise().resolves(userResources.internalUser);
        getRecordsCountStub = sinon.stub(documentRoutes, 'getRecordsCount')
            .returnsPromise().resolves({
                totalCount: recordResources.count,
            });
        searchRecordsStub = sinon.stub(documentRoutes, 'searchRecords')
            .returnsPromise().resolves({
                totalCount: recordResources.count,
                records: [Object.assign({}, recordResources.documentReferenceEncrypted)],
            });
        tagDecryptStub = sinon.stub(encryptionUtils, 'decrypt')
            .returns(testVariables.tag);
        updateRecordStub = sinon.stub(documentRoutes, 'updateRecord')
            .returnsPromise().resolves(Object.assign({}, recordResources.documentReference));
        validateStub = sinon.stub(fhirValidator, 'validate')
            .returnsPromise().resolves();

        encryptionServiceStub = sinon.stub().returns({
            decryptData: decryptDataStub,
            encryptObject: encryptObjectStub,
        });
        fhirService.encryptionService = encryptionServiceStub;
    });

    describe('createFhirRecord', () => {
        it('should resolve when called with userId and correct fhirResource', (done) => {
            fhirService.createFhirRecord(testVariables.userId, fhirResources.documentReference)
                .then(() => {
                    expect(createRecordStub).to.be.calledOnce;
                    expect(createRecordStub).to.be.calledWith(testVariables.userId);
                    expect(validateStub).to.be.calledOnce;
                    expect(validateStub).to.be.calledWith(fhirResources.documentReference);
                    expect(getInternalUserStub).to.be.calledOnce;
                    expect(getInternalUserStub).to.be.calledWith(testVariables.userId);
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
                    expect(getInternalUserStub).to.be.calledTwice;
                    expect(getInternalUserStub).to.be.calledWith(testVariables.userId);
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
                    expect(getInternalUserStub).to.be.calledOnce;
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
                    expect(getInternalUserStub).to.be.calledOnce;
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
                    expect(getInternalUserStub).to.be.calledOnce;
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
                    expect(getInternalUserStub).to.be.calledOnce;
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

    afterEach(() => {
        createRecordStub.restore();
        deleteRecordStub.restore();
        downloadRecordStub.restore();
        symEncryptStringStub.restore();
        symDecryptStringStub.restore();
        convertBase64ToArrayBufferViewStub.restore();
        convertArrayBufferViewToStringStub.restore();
        generateTagsFromFhirObjectStub.restore();
        getInternalUserStub.restore();
        searchRecordsStub.restore();
        getRecordsCountStub.restore();
        tagDecryptStub.restore();
        updateRecordStub.restore();
        validateStub.restore();
    });
});
