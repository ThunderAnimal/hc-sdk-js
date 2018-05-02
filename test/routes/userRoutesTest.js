/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import userRoutes from '../../src/routes/userRoutes';
import hcRequest from '../../src/lib/hcRequest';
import testVariables from '../testUtils/testVariables';
import encryptionResources from '../testUtils/encryptionResources';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('userRoutes', () => {
    let requestStub;

    beforeEach(() => {
        requestStub = sinon.stub(hcRequest, 'submit').returnsPromise();
    });

    it('resolveUserId returns error on request failure', (done) => {
        requestStub.rejects('error');
        userRoutes.resolveUserId('test').catch((err) => {
            expect(err).to.equal('error');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub).to.be.calledWith('POST');
            done();
        });
    });

    it('getUserDetails passes', (done) => {
        requestStub.resolves('pass');
        userRoutes.getUserDetails('test').then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub.firstCall.args[2].authorize).to.equal(true);
            expect(requestStub).to.be.calledWith('GET');
            done();
        });
    });

    it('updateUser passes', (done) => {
        requestStub.resolves('pass');
        userRoutes.updateUser({ name: 'fakeName' }).then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub.firstCall.args[2].authorize).to.equal(true);
            expect(requestStub).to.be.calledWith('PUT');
            done();
        });
    });

    it('updateUser returns error on request failure', (done) => {
        requestStub.rejects('error');
        userRoutes.updateUser({ name: 'fakeName' }).catch((err) => {
            expect(err).to.equal('error');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub).to.be.calledWith('PUT');
            done();
        });
    });

    describe('getReceivedPermissions', () => {
        it('passes', (done) => {
            requestStub.resolves([encryptionResources.permissionResponse]);
            userRoutes.getReceivedPermissions(testVariables.userId)
                .then((permissions) => {
                    expect(requestStub).to.be.calledOnce;
                    expect(requestStub).to.be.calledWith('GET');
                    expect(permissions[0]).to.equal(encryptionResources.permissionResponse);
                    done();
                })
                .catch(done);
        });
    });

    afterEach(() => {
        requestStub.restore();
    });
});
