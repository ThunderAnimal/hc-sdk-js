/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import crypto from '../../src/lib/crypto/index';

// unit
describe.only('encryptionService', () => {
    describe('symmetric', () => {
        it('should be possible to encrypt byte arrays');
        it('should be possible to decrypt byte arrays');
        it('should be possible to encrypt strings');
        it('should be possible to decrypt strings');
    });

    describe('asymmetric', () => {
        it('should be possible to encrypt');
        it('should be possible to decrypt');
        it('should be possible to encrypt strings');
        it('should be possible to decrypt strings');
    });

    // hash password
    it('should be possible to derive key');

    describe('generate keys', () => {
        it('should be possible to generate symmetric key');
        it('should be possible to generate asymmetric keys');
    });
});

// integration
describe('encryptionService', () => {
    describe('cup', () => {
        it('should be possible to create a cup');
        it('should be possible to change password');
    });

    describe('document', () => {
        it('should be possible to encrypt document');
        it('should be possible to decrypt document');
    });

    it('should be possible to change common key');
});
