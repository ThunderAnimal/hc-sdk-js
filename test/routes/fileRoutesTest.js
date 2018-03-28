/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import fileRoutes from '../../src/routes/fileRoutes';
import hcRequest from '../../src/lib/hcRequest';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('fileRoutes', () => {
    let requestStub;

    beforeEach(() => {
        requestStub = sinon.stub(hcRequest, 'submit').returnsPromise();
    });

    it('downloadFile passes', (done) => {
        requestStub.resolves('pass');
        fileRoutes.downloadFile('fakeSasUrl', 'fakeDocumentBlob').then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub).to.be.calledWith('GET');
            done();
        });
    });


    it('uploadFile passes', (done) => {
        requestStub.resolves('pass');
        fileRoutes.uploadFile('fakeSasUrl', 'fakeDocumentBlob').then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub).to.be.calledWith('PUT');
            done();
        });
    });

    it('uploadFile returns error if hcRequest returns error', (done) => {
        requestStub.rejects('error');

        fileRoutes.uploadFile('fakeSasUrl', 'fakeDocumentBlob').catch((res) => {
            expect(res).to.equal('error');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub).to.be.calledWith('PUT');
            done();
        });
    });

    afterEach(() => {
        requestStub.restore();
    });
});
