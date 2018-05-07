/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
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
import userService from '../src/services/userService';


sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('HealthCloud', () => {
    const GCSDK = GC.SDK;

    beforeEach(() => {
    });

    it('the healthcloud object is initiated correctly', () => {
        expect(typeof GCSDK).to.equal('object');
        expect(typeof GCSDK.downloadDocument).to.equal('function');
        expect(typeof GCSDK.deleteDocument).to.equal('function');
        expect(typeof GCSDK.getCurrentUserId).to.equal('function');
        expect(typeof GCSDK.getDocuments).to.equal('function');
        expect(typeof GCSDK.getDocumentsCount).to.equal('function');
        expect(typeof GCSDK.uploadDocument).to.equal('function');
        expect(typeof GCSDK.reset).to.equal('function');
        expect(typeof GCSDK.getReceivedPermissions).to.equal('function');
        expect(typeof GCSDK.grantPermission).to.equal('function');
        expect(typeof GCSDK.createCAP).to.equal('function');
        expect(typeof GCSDK.setup).to.equal('function');
        expect(typeof GCSDK.models).to.equal('object');
        expect(typeof GCSDK.models.HCDocument).to.equal('function');
        expect(typeof GCSDK.models.HCAttachment).to.equal('function');
        expect(typeof GCSDK.models.HCAuthor).to.equal('function');
        expect(typeof GCSDK.models.HCSpecialty).to.equal('object');
    });

    describe('setup', () => {
        let requestAccessTokenStub;
        let getUserStub;

        beforeEach(() => {
            requestAccessTokenStub = sinon.stub().returnsPromise().resolves();
            getUserStub = sinon.stub(userService, 'getUser').returnsPromise().resolves({ id: testVariables.userId });
        });

        it('makes its calls', (done) => {
            GCSDK.setup(
                testVariables.clientId,
                btoa(JSON.stringify(encryptionResources.hcPrivateKey)),
                requestAccessTokenStub)
                .then((res) => {
                    expect(res).to.equal(testVariables.userId);
                    expect(taggingUtils.clientId).to.equal(testVariables.clientId);
                    expect(requestAccessTokenStub).to.be.calledOnce;
                    expect(hcRequest.requestAccessToken).to.equal(requestAccessTokenStub);
                    done();
                })
                .catch(done);
        });

        afterEach(() => {
            getUserStub.restore();
        });
    });
});
