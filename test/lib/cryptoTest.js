/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable max-nested-callbacks */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import hcCrypto from '../../src/lib/crypto';
import encryptionResources from '../testUtils/encryptionResources';

chai.use(sinonChai);
const expect = chai.expect;

describe('crypto', () => {
    describe('asym Ecnryption', () => {
        let privateKey;

        let publicKey;
        const cipherText = 'aGUPobvIYCsTtZlQxQ/z8tCpBEiTKNBcZ3wtt6dlTlSwJYT9TyB9lh3LXh7nYtBn/idJ0YoHCgkgt1pO9u0xHnhBzRJVllgCrGN30y3rwO+mz7xr+z/nyqVyrsiOsUPfbS4ojrUszVAxbXLdyq2bVgQ4wV4suBTWJ/41Cx/Tvhlj6C7lph4cSj+R+SOArayRIAcwgDgAY+ThY4/+1JWqH4GNq2QmGplwfoDVvVYDMfepUN6K1E7APnELKNvz89s6/z+n3GTtrntx5Tbos6aD3hafrPbESj/fbK7gaVdUcM6VhJy4RBtDzg0Y4u4Q/hg0W9u+sjZEnHR6s83t4syM7w==';
        const plainText = 'Hello Martians!';
        let cipherResult;

        describe('getPublicKeyFromSPKI', () => {
            it('should import a SPKI key correctly', (done) => {
                hcCrypto.importPublicKeyFromSPKI(encryptionResources.SPKIKey)
                    .then((pk) => {
                        publicKey = pk;
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getSPKIFromPublicKey', () => {
            it('should export key to SPKIKey correctly', (done) => {
                hcCrypto.exportPublicKeyToSPKI(publicKey)
                    .then((SPKI) => {
                        expect(SPKI).to.equal(encryptionResources.SPKIKey);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getPrivateKeyFromPKCS8', () => {
            it('should import PKCS8 key correctly', (done) => {
                hcCrypto.importPrivateKeyFromPKCS8(encryptionResources.PKCS8Key)
                    .then((pk) => {
                        privateKey = pk;
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getPKCS8FromPrivateKey', () => {
            it('should export key to PKCS8 correctly', (done) => {
                hcCrypto.exportPrivateKeyToPKCS8(privateKey)
                    .then((PKCS8) => {
                        expect(PKCS8).to.equal(encryptionResources.PKCS8Key);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('asymEncryptString', () => {
            it(`should encrypt ${plainText} to ${cipherText}`, (done) => {
                hcCrypto.asymEncryptString(encryptionResources.hcPublicKey, plainText)
                    .then((ct) => {
                        cipherResult = ct;
                        expect(cipherResult).to.not.equal(plainText);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('asymDecryptString', () => {
            it(`should decrypt ${cipherText} and ${cipherResult} to ${plainText}`, (done) => {
                Promise.all([
                    hcCrypto.asymDecryptString(encryptionResources.hcPrivateKey, cipherText),
                    hcCrypto.asymDecryptString(encryptionResources.hcPrivateKey, cipherResult),
                ])
                    .then((result) => {
                        // tests if the cipherText from above is decrypted correctly
                        expect(result[0]).to.equal(plainText);
                        // tests if the cipherResult from the previous test is decrypted correctly
                        expect(result[1]).to.equal(plainText);
                        done();
                    })
                    .catch(done);
            });
        });

        it('should be possible to derive a key');
        it('should be possible to generate a symmetric key');
        it('should be possible to generate an asymmetric key-pair');
    });

    describe('symmetric encryption', () => {
        let symKey;
        const plainText = 'Hello Martians!';
        const cipherText = 'CLauEB1h72xTLpONZC218tmo+wWxBKdgAG+6XpzAsh/oaS03pv4R26w2NRw5toA=';
        let cipherText1;
        let cipherText2;

        describe('importSymKeyFromBase64', () => {
            it('should import a raw key correctly', (done) => {
                hcCrypto.importSymKeyFromBase64(encryptionResources.rawSymKey)
                    .then((key) => {
                        symKey = key;
                        done();
                    })
                    .catch(done);
            });
        });

        describe('exportSymKeyToBase64', () => {
            it('should export key to raw key correctly', (done) => {
                hcCrypto.exportSymKeyToBase64(symKey)
                    .then((key) => {
                        expect(key).to.equal(encryptionResources.rawSymKey);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('symEncryptString', () => {
            it(`should encrypt ${plainText} different each time`, (done) => {
                Promise.all([
                    hcCrypto.symEncryptString(encryptionResources.symHCKey, plainText),
                    hcCrypto.symEncryptString(encryptionResources.symHCKey, plainText),
                ])
                    .then(([ct1, ct2]) => {
                        [cipherText1, cipherText2] = [ct1, ct2];
                        expect(ct1).to.not.equal(ct2);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('asymDecryptString', () => {
            it(`should decrypt ${cipherText} to ${plainText}`, (done) => {
                hcCrypto.symDecryptString(encryptionResources.symHCKey, cipherText)
                    .then((result) => {
                        expect(result).to.equal(plainText);
                        done();
                    })
                    .catch(done);
            });

            it(`should decrypt previously encrypted texts to ${plainText}`, (done) => {
                hcCrypto.symDecryptString(encryptionResources.symHCKey, cipherText1);
                hcCrypto.symDecryptString(encryptionResources.symHCKey, cipherText1)
                    .then((result) => {
                        expect(result).to.equal(plainText);
                        done();
                    })
                    .catch(done);
            });
        });

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
