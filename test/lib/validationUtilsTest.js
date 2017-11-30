/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import validationUtils from '../../src/lib/validationUtils';

chai.use(sinonChai);

const expect = chai.expect;

describe('validationUtils', () => {
	it('validateEmail validates a valid email', (done) => {
		const email = 'dummyUser@domain.com';
		const isValid = validationUtils.validateEmail(email);
		expect(isValid).to.equal(true);
		done();
	});

	it('validateEmail invalidates an invalid email', (done) => {
		const email = 'dummyUser';
		const isValid = validationUtils.validateEmail(email);
		expect(isValid).to.equal(false);
		done();
	});
});
