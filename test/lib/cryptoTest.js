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
import asymEncryptJson from '../testUtils/cryptoResources/asymEncrypt.json';
import asymDecryptJson from '../testUtils/cryptoResources/asymDecrypt.json';
import symDecryptJson from '../testUtils/cryptoResources/symDecrypt.json';
import tekEncryptJson from '../testUtils/cryptoResources/tekEncrypt.json';
import tekDecryptJson from '../testUtils/cryptoResources/tekDecrypt.json';
import exchangeKeyAppPublicKey from '../testUtils/cryptoResources/exchange_key_app_public_v1.json';
import exchangeKeyAppPrivateKey from '../testUtils/cryptoResources/exchange_key_app_private_v1.json';
import exchangeKeyCommonKey from '../testUtils/cryptoResources/exchange_key_common_v1.json';

chai.use(sinonChai);
const expect = chai.expect;

describe('crypto', () => {
    describe('asymmetric Ecnryption and decryption', () => {
        let privateKey;
        let publicKey;

        describe('getPublicKeyFromSPKI', () => {
            it('should import a SPKI key correctly', (done) => {
                hcCrypto.importPublicKeyFromSPKI(exchangeKeyAppPublicKey.pub)
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
                        expect(SPKI).to.equal(exchangeKeyAppPublicKey.pub);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getPrivateKeyFromPKCS8', () => {
            it('should import PKCS8 key correctly', (done) => {
                hcCrypto.importPrivateKeyFromPKCS8(exchangeKeyAppPrivateKey.priv)
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
                        expect(PKCS8).to.equal(exchangeKeyAppPrivateKey.priv);
                        done();
                    })
                    .catch(done);
            });
        });


        // Since asymEncrypting every time with a publicKey gives different result every time,
        // we use corresponding private key to make sure that it decrypts to the right value.
        describe('asymmetric encryption', () => {
            it('should be possible to encrypt byte arrays', (done) => {
                hcCrypto.asymEncryptString(asymEncryptJson.public, atob(asymEncryptJson.input))
                    .then(encryptedResult => hcCrypto.asymDecryptString(
                        asymEncryptJson.private,
                        encryptedResult,
                    ))
                    .then((decryptedResult) => {
                        expect(btoa(decryptedResult)).to.equal(asymEncryptJson.input);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('asymmetric decryption', () => {
            it('should be possible to decrypt byte arrays', (done) => {
                hcCrypto.asymDecryptString(asymDecryptJson.key, asymDecryptJson.input)
                    .then((result) => {
                        expect(btoa(result)).to.equal(asymDecryptJson.output);
                        done();
                    });
            });

            it('should decrypt two encrypted strings into same decypted string', (done) => {
                hcCrypto.asymEncryptString(asymEncryptJson.public, atob(asymEncryptJson.input))
                    .then(encryptedResult => Promise.all([
                        hcCrypto.asymDecryptString(asymEncryptJson.private, encryptedResult),
                        hcCrypto.asymDecryptString(
                            asymEncryptJson.private,
                            asymEncryptJson.output),
                    ])
                        .then((result) => {
                            expect(result[0]).to.equal(atob(asymEncryptJson.input));
                            expect(result[1]).to.equal(atob(asymEncryptJson.input));
                            done();
                        })
                        .catch(done));
            });
        });

        it('should be possible to derive a key');
        it('should be possible to generate a symmetric key');
        it('should be possible to generate an asymmetric key-pair');
    });

    describe('symmetric encryption', () => {
        let symKey;
        const plainText = 'Hello Martians!';

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
                    hcCrypto.symEncryptString(exchangeKeyCommonKey, plainText),
                    hcCrypto.symEncryptString(exchangeKeyCommonKey, plainText),
                ])
                    .then(([ct1, ct2]) => {
                        expect(ct1).to.not.equal(ct2);
                        done();
                    })
                    .catch(done);
            });

            it('should verify symmetric encryption flow', (done) => {
                hcCrypto.symEncryptString(symDecryptJson.key, symDecryptJson.input)
                    .then(encryptedResult => hcCrypto.symDecryptString(
                        symDecryptJson.key,
                        encryptedResult,
                    ))
                    .then((decryptedResult) => {
                        expect(decryptedResult).to.equal(symDecryptJson.input);
                        done();
                    })
                    .catch(done);
            });

            it('should verify symmetric decryption', (done) => {
                hcCrypto.symDecryptString(
                    symDecryptJson.key,
                    btoa(atob(symDecryptJson.iv) + atob(symDecryptJson.input)))
                    .then((encryptedResult) => {
                        expect(btoa((encryptedResult))).to.equal(symDecryptJson.output);
                        done();
                    })
                    .catch(done);
            });

            it(tekEncryptJson.test, (done) => {
                hcCrypto.symEncryptString(tekEncryptJson.key, tekEncryptJson.input)
                    .then((encryptedResult) => {
                        expect(encryptedResult).to.equal(tekEncryptJson.output);
                        done();
                    });
            });

            it(tekDecryptJson.test, (done) => {
                hcCrypto.symDecryptString(tekDecryptJson.key, tekDecryptJson.input)
                    .then((encryptedResult) => {
                        expect(encryptedResult).to.equal(tekDecryptJson.output);
                        done();
                    });
            });
        });
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
