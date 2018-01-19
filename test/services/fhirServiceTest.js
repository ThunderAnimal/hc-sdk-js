/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';

import documentRoutes from '../../src/routes/documentRoutes';
import FhirService from '../../src/services/FhirService';
import userService from '../../src/services/userService';
import encryptionUtils from '../../src/lib/EncryptionUtils';
import fhirValidator from '../../src/lib/fhirValidator';
import ZeroKitAdapter from '../../src/services/ZeroKitAdapter';
import taggingUtils from '../../src/lib/taggingUtils';
import stringUtils from '../../src/lib/stringUtils';


import testVariables from '../testUtils/testVariables';
import userResources from '../testUtils/userResources';
import fhirResources from '../testUtils/fhirResources';
import recordResources from '../testUtils/recordResources';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('services/fhirService', () => {
    const authService = { clientId: testVariables.clientId };

    let zeroKitAdapter;
    let fhirService;

    let createRecordStub;
    let decryptStub;
    let deleteRecordStub;
    let downloadRecordStub;
    let encryptStub;
    let generateTagsFromFhirObjectStub;
    let getInternalUserStub;
    let searchRecordsStub;
    let getRecordsCountStub;
    let tagDecryptStub;
    let tagEncryptStub;
    let updateRecordStub;
    let validateStub;

    beforeEach(() => {
        createRecordStub = sinon.stub(documentRoutes, 'createRecord')
            .returnsPromise().resolves(Object.assign({}, recordResources.documentReference));
        decryptStub = sinon.stub(ZeroKitAdapter, 'decrypt')
            .returnsPromise().resolves(
                JSON.stringify(Object.assign({}, fhirResources.documentReference)));
        deleteRecordStub = sinon.stub(documentRoutes, 'deleteRecord')
            .returnsPromise().resolves();
        downloadRecordStub = sinon.stub(documentRoutes, 'downloadRecord')
            .returnsPromise().resolves(
                Object.assign({}, recordResources.documentReferenceEncrypted));
        encryptStub = sinon.stub(ZeroKitAdapter, 'encrypt')
            .returnsPromise().resolves('encrypted_body');
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
        tagEncryptStub = sinon.stub(encryptionUtils, 'encrypt')
            .returns(testVariables.encryptedTag);
        updateRecordStub = sinon.stub(documentRoutes, 'updateRecord')
            .returnsPromise().resolves(Object.assign({}, recordResources.documentReference));
        validateStub = sinon.stub(fhirValidator, 'validate')
            .returnsPromise().resolves();

        zeroKitAdapter = {
            decrypt: decryptStub,
            encrypt: encryptStub,
            authService,
        };
        fhirService = new FhirService({ zeroKitAdapter });
    });

    it('createFhirRecord - Happy Path', (done) => {
        fhirService.createFhirRecord(testVariables.userId, fhirResources.documentReference)
            .then(() => {
                expect(createRecordStub).to.be.calledOnce;
                expect(tagEncryptStub.getCall(1).args[0])
                    .to.equal(`client=${stringUtils.addPercentEncoding(testVariables.clientId)}`);
                expect(createRecordStub).to.be.calledWith(testVariables.userId);
                expect(validateStub).to.be.calledOnce;
                expect(validateStub).to.be.calledWith(fhirResources.documentReference);
                expect(getInternalUserStub).to.be.calledOnce;
                expect(getInternalUserStub).to.be.calledWith(testVariables.userId);
                done();
            })
            .catch(done);
    });

    it('createFhirRecord - fails when fhirValidation fails', (done) => {
        validateStub.rejects();

        fhirService.uploadFhirRecord(testVariables.userId, fhirResources.documentReference)
            .then(() => done(Error('fhirValidation didn\'t fail as expected')))
            .catch(() => {
                expect(validateStub).to.be.calledOnce;
                expect(createRecordStub).to.not.be.called;
                done();
            });
    });

    it('updateFhirRecord - Happy Path', (done) => {
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

    it('downloadFhirRecord - Happy Path', (done) => {
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

    it('searchRecords - works as expected with all parameters', (done) => {
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
            tags: `${testVariables.encryptedTag},${testVariables.encryptedTag},${testVariables.encryptedTag}`,
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

    it('searchRecords - returns only count when one of params is countOnly', (done) => {
        const params = {
            client_id: testVariables.clientId,
        };

        const expectedParamsForRoute = {
            tags: `${testVariables.encryptedTag}`,
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

    it('searchRecords - parses the clientId as a tag', (done) => {
        const params = {
            client_id: testVariables.clientId,
        };

        const expectedParamsForRoute = {
            tags: `${testVariables.encryptedTag}`,
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

    it('deleteRecord - Happy Path', (done) => {
        FhirService.deleteRecord(testVariables.userId, testVariables.recordId)
            .then(() => {
                expect(deleteRecordStub).to.be.calledOnce;
                expect(deleteRecordStub).to.be
                    .calledWith(testVariables.userId, testVariables.recordId);
                done();
            })
            .catch(done);
    });

    afterEach(() => {
        createRecordStub.restore();
        decryptStub.restore();
        deleteRecordStub.restore();
        downloadRecordStub.restore();
        encryptStub.restore();
        generateTagsFromFhirObjectStub.restore();
        getInternalUserStub.restore();
        searchRecordsStub.restore();
        getRecordsCountStub.restore();
        tagDecryptStub.restore();
        tagEncryptStub.restore();
        updateRecordStub.restore();
        validateStub.restore();
    });
});
