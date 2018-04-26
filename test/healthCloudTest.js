/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import GC from '../src/healthCloud';
import testVariables from './testUtils/testVariables';
import taggingUtils from '../src/lib/taggingUtils';
import hcRequest from '../src/lib/hcRequest';
import encryptionResources from './testUtils/encryptionResources';


sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('HealthCloud', () => {
    const GCSDK = GC.SDK;

    beforeEach(() => {
    });

    it('the healthcloud object is initiated correctly', (done) => {
        expect(typeof GCSDK).to.equal('object');
        expect(typeof GCSDK.downloadDocument).to.equal('function');
        expect(typeof GCSDK.uploadDocument).to.equal('function');
        expect(typeof GCSDK.getDocuments).to.equal('function');
        expect(typeof GCSDK.getDocumentsCount).to.equal('function');
        expect(typeof GCSDK.getUser).to.equal('function');
        expect(typeof GCSDK.updateUser).to.equal('function');
        expect(typeof GCSDK.getUserIdByAlias).to.equal('function');

        done();
    });

    describe('setup', () => {
        let requestAccessTokenStub;
        beforeEach(() => {
            requestAccessTokenStub = sinon.stub().returnsPromise().resolves();
        });
        it('makes its calls', () => {
            GCSDK.setup(
                testVariables.clientId,
                btoa(JSON.stringify(encryptionResources.hcPrivateKey)),
                requestAccessTokenStub);
            expect(taggingUtils.clientId).to.equal(testVariables.clientId);
            expect(requestAccessTokenStub).to.be.calledOnce;
            expect(hcRequest.requestAccessToken).to.equal(requestAccessTokenStub);
        });
    });
});
