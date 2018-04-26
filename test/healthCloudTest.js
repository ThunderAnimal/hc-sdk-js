/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import HealthCloud from '../src/HealthCloud';
import encryptionResources from './testUtils/encryptionResources';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;
const base64privateKey = btoa(JSON.stringify(encryptionResources.privateKeyClientUser));

describe('HealthCloud', () => {
    beforeEach(() => {
    });

    it('sdk is callable', (done) => {
        expect(typeof HealthCloud).to.equal('function');
        done();
    });

    it('the healthcloud object is initiated correctly', (done) => {
        const healthCloud = new HealthCloud('1', base64privateKey);
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
