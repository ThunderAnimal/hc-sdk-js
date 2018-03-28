/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import fhirRoutes from '../../src/routes/fhirRoutes';
import hcRequest from '../../src/lib/hcRequest';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('fhirRoutes', () => {
    let requestStub;

    beforeEach(() => {
        requestStub = sinon.stub(hcRequest, 'submit').returnsPromise();
    });

    it('getSchema passes', (done) => {
        requestStub.resolves('pass');
        fhirRoutes.getFhirSchema().then((res) => {
            expect(res).to.equal('pass');
            expect(requestStub).to.be.calledOnce;
            expect(requestStub).to.be.calledWith('GET');
            done();
        });
    });

    afterEach(() => {
        requestStub.restore();
    });
});
