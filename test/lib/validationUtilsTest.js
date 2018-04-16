/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { validateEmail, ensureArrayIfExists, ensureDateIfExists } from '../../src/lib/validationUtils';

chai.use(sinonChai);

const expect = chai.expect;

describe('validationUtils', () => {
    it('should validate email', () => [{
        data: 'email@domain.com',
        expectedResult: true,
    }, {
        data: 'firstname.lastname@domain.com',
        expectedResult: true,
    }, {
        data: 'email@subdomain.domain.com',
        expectedResult: true,
    }, {
        data: 'firstname+lastname@domain.com',
        expectedResult: true,
    }, /* { // This is actually a valid email address
        data: 'email@123.123.123.123',
        expectedResult: true,
    }, */ {
        data: '1234567890@domain.com',
        expectedResult: true,
    }, {
        data: 'email@domain-one.com',
        expectedResult: true,
    }, {
        data: 'Dänaßäna@gmail.com',
        expectedResult: true,
    }, {
        data: 'あいうえお@domain.com',
        expectedResult: true,
    }, {
        data: 'email@domain.co.jp',
        expectedResult: true,
    }, {
        data: 'firstname-lastname@domain.com',
        expectedResult: true,
    }, {
        data: '_______@domain.com',
        expectedResult: true,
    }, {
        data: 'plainaddress',
        expectedResult: false,
    }, {
        data: '#@%^%#$@#$@#.com',
        expectedResult: false,
    }, {
        data: 'Joe Smith <email@domain.com>',
        expectedResult: false,
    }, {
        data: 'email.domain.com',
        expectedResult: false,
    }, {
        data: 'email@domain@domain.com',
        expectedResult: false,
    }, {
        data: '.email@domain.com',
        expectedResult: false,
    }, {
        data: 'email.@domain.com',
        expectedResult: false,
    }, {
        data: 'email..email@domain.com',
        expectedResult: false,
    }, {
        data: 'email@domain.com (Joe Smith)',
        expectedResult: false,
    }, {
        data: 'email@domain',
        expectedResult: false,
    }, {
        data: 'email@-domain.com',
        expectedResult: false,
    }, {
        data: 'email@111.222.333.44444',
        expectedResult: false,
    }, {
        data: 'email@domain..com',
        expectedResult: false,
    }].forEach(({ data, expectedResult }) => {
        it(`should validate email "${data}" as ${expectedResult}`, (done) => { // eslint-disable-line
            const isValid = validateEmail(data);
            expect(isValid).to.equal(expectedResult);
            done();
        });
    }));

    it('should ignore array validation when is undefined', () => {
        expect(ensureArrayIfExists(undefined)).to.equal(undefined);
    });

    it('should validate array when is array', () => {
        const arr = [];
        expect(ensureArrayIfExists(arr)).to.equal(arr);
    });

    it('should throw when not array', () => {
        const arr = {};
        expect(() => ensureArrayIfExists(arr)).to.throw();
    });

    it('should ignore date validation when is undefined', () => {
        expect(ensureDateIfExists(undefined)).to.equal(undefined);
    });

    it('should validate date when is date', () => {
        const date = new Date();
        expect(ensureDateIfExists(date)).to.equal(date);
    });

    it('should throw when not date', () => {
        const date = 1;
        expect(() => ensureDateIfExists(date)).to.throw();
    });
});
