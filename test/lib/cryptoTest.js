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
        const PKCS8Key = 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCjkChc6JDFN+vGYOFZ7ERYdh3wKculvC9sec7jlqgEIJmsJ9ds694fJ0XEBDE4ntcbIvYAOszTg/mV4c/h0yw91yRyMKUbO8EeOv09mvOFd21UzeITjK5AcKBIqGOa2BMCE5Z/Fnh5pzx8a9eaMYlueB2TVFzYOgrG7J4J0QvCZqnpKBpjoDByBrGFRYU3ZlVovBRB9UgqMrrNjSxib1F2Q44gKXx3pdfGzO7C8XbPcikal7vOuJwOA8ErnBlwmqSif7cB6OCM9D2ACjLMCGxfSuhxNr+bOSMZZe1aqLh7fZTgAnapIcotB92FVdhQ6hX7yPnKU9NQSnufOJoNOnv1AgMBAAECggEABsAkN6gY6C2FgMkD0/3Gg64lpdaxGH8v/TajyCHc1QVxbOOyEO/v2XJPVKaQT37CxanHjxKI3Jv1o5l6cR68PzXPbm+9M2a1HZB1XjhfH52NDh3MhwkHMhKpPYZxofTpXUG+CYhoYtZOTpuhfjQthg6ADfzCiOFltiMS52MmLJjrik1gKlsbZ3nBq57atf8j6v55mfplVUhEszMaMqG8P9JWhHOUASuWu+xUXyOakO/P7sqrKdSC8vssWcZ83pP7guXOyo8QmEvaKUZeFEp7EbJcZJS9bqtYgZGqJBthlMJgkproLDHJy8J0u9HdwnHcTVSGLL6NDFP3+A0Qnq53ewKBgQDX8t3zL000K39Ytpq0Mu26aJp+stQQPO/0IqVfJN/nUSoVOTt2qrBM0dGZdGfjf9tT0xU8VqKsS+gTq8e1iRiGD0Yp4AN38uSDdi8dba83y9NuskwgkqNk7k3UiYjB/koHW8WBWv9pE8yHDddIsy7k1Bfm2SWAOw67tLXuuCM47wKBgQDB5gzXfbYuRaFQML/DzAd7E5dIUS9CdoC5Ht1ieV3c/eBigb6sLfIxIymmZ7Ma9yeS9GK/p5C6cSixDavKGW6VHTAFhKgMTdxy3nFAjyXzzle+v2ypqH5ZTNnAyWi+PZqG8Lw21mldPsAoTRFpXaEP8rDiXRY9vHBMDW5uNyixWwKBgGB0Ad6Uyg77Pq4JIaBK/xO7lQXyKfX2wdZxgxu0BK30+q7wGTcvlf852DyKWbyrZvNR3LJOn+oFHWtr1o+m5GU8fUJG5EW3H4n4R6MFUrXBPHa8/HOwC3sRVYIQzByZz8bpnpXgZyQvy7Km4/l8zv02HlbltnJH7pS4amptpI3RAoGAVcgzMjrZmIsRnOqUTEk9ngPC0CmqoNrQhBXVl7VeA2EGHk6MTpxdI8QMryP9pxZlGayo62V0sCdT+1CzCcxKkgnBrw9LUXY461DiBc/O2JgXVbpWlpCGpXdMdvAkONYEQWLLwe8F2kzisnG2HElh8i5Kdzr7lgCCJgNjMbuRczUCgYAcJz/5hFRSRyKdJkyP43ZZK6wNSfQlG+7Qq5x5n43UMmR1gylDw0J+zh2/JmZCcrqhXoPVTaN+CtRvCnNT5GnMj+aCQbod67xHf3bLnCZlyHWJtZwUkNuEICurMHvbXyxJFZc33VeXoC3msfh8WHLw2hMs5LXDWe/UvafB3o4ecA==';
        const privHCKey = {
            t: 'privA',
            v: 1,
            priv: PKCS8Key,
        };
        let privateKey;

        const SPKIKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo5AoXOiQxTfrxmDhWexEWHYd8CnLpbwvbHnO45aoBCCZrCfXbOveHydFxAQxOJ7XGyL2ADrM04P5leHP4dMsPdckcjClGzvBHjr9PZrzhXdtVM3iE4yuQHCgSKhjmtgTAhOWfxZ4eac8fGvXmjGJbngdk1Rc2DoKxuyeCdELwmap6SgaY6AwcgaxhUWFN2ZVaLwUQfVIKjK6zY0sYm9RdkOOICl8d6XXxszuwvF2z3IpGpe7zricDgPBK5wZcJqkon+3AejgjPQ9gAoyzAhsX0rocTa/mzkjGWXtWqi4e32U4AJ2qSHKLQfdhVXYUOoV+8j5ylPTUEp7nziaDTp79QIDAQAB';
        const pubHCKey = {
            t: 'pubA',
            v: 1,
            pub: SPKIKey,
        };
        let publicKey;
        const cipherText = 'aGUPobvIYCsTtZlQxQ/z8tCpBEiTKNBcZ3wtt6dlTlSwJYT9TyB9lh3LXh7nYtBn/idJ0YoHCgkgt1pO9u0xHnhBzRJVllgCrGN30y3rwO+mz7xr+z/nyqVyrsiOsUPfbS4ojrUszVAxbXLdyq2bVgQ4wV4suBTWJ/41Cx/Tvhlj6C7lph4cSj+R+SOArayRIAcwgDgAY+ThY4/+1JWqH4GNq2QmGplwfoDVvVYDMfepUN6K1E7APnELKNvz89s6/z+n3GTtrntx5Tbos6aD3hafrPbESj/fbK7gaVdUcM6VhJy4RBtDzg0Y4u4Q/hg0W9u+sjZEnHR6s83t4syM7w==';
        const plainText = 'Hello Martians!';
        let cipherResult;

        describe('getPublicKeyFromSPKI', () => {
            it('should import a SPKI key correctly', (done) => {
                hcCrypto.importPublicKeyFromSPKI(SPKIKey)
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
                        expect(SPKI).to.equal(SPKIKey);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getPrivateKeyFromPKCS8', () => {
            it('should import PKCS8 key correctly', (done) => {
                hcCrypto.importPrivateKeyFromPKCS8(PKCS8Key)
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
                        expect(PKCS8).to.equal(PKCS8Key);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('asymEncryptString', () => {
            it(`should encrypt ${plainText} to ${cipherText}`, (done) => {
                hcCrypto.asymEncryptString(pubHCKey, plainText)
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
                    hcCrypto.asymDecryptString(privHCKey, cipherText),
                    hcCrypto.asymDecryptString(privHCKey, cipherResult),
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
        const cipherText = 'xUzWAW9X4M3y5dDjqIupffk14w0hMD0ZvhGMfAm/HKw=';
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
