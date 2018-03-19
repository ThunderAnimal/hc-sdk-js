/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';

import ValidationError from '../../src/lib/errors/ValidationError';
import SetupError from '../../src/lib/errors/SetupError';

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

describe('ValidationError', () => {
    it('getConformance succeeds', (done) => {
        const errorMsg = 'some message';
        const loginError = new SetupError(errorMsg);
        expect(loginError.name).to.equal('SetupError');
        expect(loginError.message).to.equal(errorMsg);
        done();
    });
});
