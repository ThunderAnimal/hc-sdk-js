/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import HealthCloud from '../src/HealthCloud';

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe('HealthCloud', () => {
	beforeEach(() => {
	});

	it('sdk is callable', (done) => {
		expect(typeof HealthCloud).to.equal('function');
		done();
	});

	it('the healthcloud object is initiated correctly', (done) => {
		const healthCloud = new HealthCloud({ clientId: '1' });

		expect(typeof healthCloud).to.equal('object');
		expect(typeof healthCloud.getLoginForm).to.equal('function');
		expect(typeof healthCloud.getRegistrationForm).to.equal('function');
		expect(typeof healthCloud.downloadDocument).to.equal('function');
		expect(typeof healthCloud.uploadDocument).to.equal('function');
		expect(typeof healthCloud.getUser).to.equal('function');
		done();
	});
});

