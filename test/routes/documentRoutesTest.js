/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import config from 'config';
import documentRoutes from '../../src/routes/documentRoutes';
import testVariables from '../../test/testUtils/testVariables';
import recordResources from '../../test/testUtils/recordResources';
import hcRequest from '../../src/lib/hcRequest';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('documentRoutes', () => {
    let requestStub;

    beforeEach(() => {
        requestStub = sinon.stub(hcRequest, 'submit').returnsPromise();
    });

    it('getFileDownloadUrl passes', (done) => {
        requestStub.resolves('pass');
        documentRoutes.getFileDownloadUrl('fakeUserAlias',
            'fakeDocumentId').then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub.firstCall.args[2].authorize).to.equal(true);
            expect(requestStub).to.be.calledWith('GET');
            done();
        });
    });

    it('getFileUploadUrls passes', (done) => {
        requestStub.resolves('pass');

        documentRoutes.getFileUploadUrls('fakeUserAlias', 'fakeRecordId', '42').then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub.firstCall.args[2].authorize).to.equal(true);
            expect(requestStub).to.be.calledWith('POST');
            done();
        });
        requestStub.reset();
    });

    it('createRecord passes', (done) => {
        requestStub.resolves('pass');

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

        documentRoutes.createRecord('fakeUserId', params).then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub.firstCall.args[2].authorize).to.equal(true);
            expect(requestStub).to.be.calledWith('POST');
            done();
        });
    });

    it('downloadRecord passes', (done) => {
        requestStub.resolves('pass');

        documentRoutes.downloadRecord('fakeUserId', 'fakeRecordId').then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub.firstCall.args[2].authorize).to.equal(true);
            expect(requestStub).to.be.calledWith('GET');
            done();
        });
    });

    it('updateRecordStatus passes', (done) => {
        requestStub.resolves('pass');

        documentRoutes.updateRecordStatus('fakeUserId', 'fakeRecordId', 'Active').then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub.firstCall.args[2].authorize).to.equal(true);
            expect(requestStub).to.be.calledWith('PUT',
                `${config.api}/users/fakeUserId/records/fakeRecordId/status/Active`);
            done();
        });
    });

    it('searchRecord passes', (done) => {
        const searchParmas = { tags: [testVariables.tag] };
        requestStub.withArgs('GET', `${config.api}/users/${testVariables.userId}/records`, { query: searchParmas, authorize: true, includeResponseHeaders: true })
            .resolves({ body: [], headers: { 'x-total-count': recordResources.count } });

        documentRoutes.searchRecords(testVariables.userId, searchParmas).then((res) => {
            expect(requestStub).to.be.calledOnce;
            expect(res.totalCount).to.equal(recordResources.count);
            done();
        }).catch(done);
    });

    it('getRecordCount passes', (done) => {
        const searchParmas = { tags: [testVariables.tag] };
        requestStub.withArgs('HEAD', `${config.api}/users/${testVariables.userId}/records`, { query: searchParmas, authorize: true, includeResponseHeaders: true })
            .resolves({ body: [], headers: { 'x-total-count': recordResources.count } });

        documentRoutes.getRecordsCount(testVariables.userId, searchParmas).then((res) => {
            expect(requestStub).to.be.calledOnce;
            expect(res.totalCount).to.equal(recordResources.count);
            done();
        }).catch(done);
    });

    afterEach(() => {
        requestStub.restore();
    });
});
