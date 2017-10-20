/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';

import ValidationError from '../../src/lib/errors';

chai.use(sinonChai);

const expect = chai.expect;

describe('ValidationError', () => {
	it('getConformance succeeds', (done) => {
		const validationError = new ValidationError('Not a valid resource type');
		expect(validationError.name).to.equal('ValidationError');
		expect(validationError.message).to.equal('Not a valid resource type');
		done();
	});
});
