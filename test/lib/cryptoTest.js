/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable max-nested-callbacks */
import 'babel-polyfill';
import crypto from '../../src/lib/crypto';

describe('encryptionService', () => {
    describe('keys', () => {
        it('should be possible to derive a key');
        it('should be possible to generate a symmetric key');
        it('should be possible to generate an asymmetric key-pair');
    });

    describe('symmetric', () => {
        it('should be possible to encrypt byte arrays');
        it('should be possible to decrypt byte arrays');
    });

    describe('asymmetric', () => {
        it('should be possible to encrypt byte arrays');
        it('should be possible to decrypt byte arrays');
    });

    describe('jwk mapping', () => {
        it('should be possible to make a JWK');
        it('should be possible to get key from JWK');
        it('should be possible to get JWK from key');
    });

    describe('arrayBuffer', () => {
        it('should be possible to convert to ArrayBuffer');
        it('should be possible to convert to String');
    });
});
