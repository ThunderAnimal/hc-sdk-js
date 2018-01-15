/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import proxy from 'proxyquireify';
import '../../src/routes/fhirRoutes';

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;


describe('fhirRoutes', () => {
    let requestStub;
    let fhirRoutes;

    beforeEach(() => {
        requestStub = sinon.stub().returnsPromise();
        fhirRoutes = proxyquire('../../src/routes/fhirRoutes', {
            '../lib/hcRequest': { default: requestStub },
        }).default;
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
        requestStub.reset();
    });
});
