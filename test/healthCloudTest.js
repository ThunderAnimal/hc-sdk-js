/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import { healthCloud } from '../src/healthCloud';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('HealthCloud', () => {
    beforeEach(() => {
    });

    it('the healthcloud object is initiated correctly', (done) => {
        expect(typeof healthCloud).to.equal('object');
        expect(typeof healthCloud.downloadDocument).to.equal('function');
        expect(typeof healthCloud.uploadDocument).to.equal('function');
        expect(typeof healthCloud.getDocuments).to.equal('function');
        expect(typeof healthCloud.getDocumentsCount).to.equal('function');
        expect(typeof healthCloud.getUser).to.equal('function');
        expect(typeof healthCloud.updateUser).to.equal('function');
        expect(typeof healthCloud.getUserIdByAlias).to.equal('function');

        done();
    });
});
