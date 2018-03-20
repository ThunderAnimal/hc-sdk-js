/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable max-nested-callbacks */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import crypto from '../../src/lib/crypto';


chai.use(sinonChai);
const expect = chai.expect;

describe('encryptionService', () => {
    describe('keys', () => {
        const PKCS8Key = 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCjkChc6JDFN+vGYOFZ7ERYdh3wKculvC9sec7jlqgEIJmsJ9ds694fJ0XEBDE4ntcbIvYAOszTg/mV4c/h0yw91yRyMKUbO8EeOv09mvOFd21UzeITjK5AcKBIqGOa2BMCE5Z/Fnh5pzx8a9eaMYlueB2TVFzYOgrG7J4J0QvCZqnpKBpjoDByBrGFRYU3ZlVovBRB9UgqMrrNjSxib1F2Q44gKXx3pdfGzO7C8XbPcikal7vOuJwOA8ErnBlwmqSif7cB6OCM9D2ACjLMCGxfSuhxNr+bOSMZZe1aqLh7fZTgAnapIcotB92FVdhQ6hX7yPnKU9NQSnufOJoNOnv1AgMBAAECggEABsAkN6gY6C2FgMkD0/3Gg64lpdaxGH8v/TajyCHc1QVxbOOyEO/v2XJPVKaQT37CxanHjxKI3Jv1o5l6cR68PzXPbm+9M2a1HZB1XjhfH52NDh3MhwkHMhKpPYZxofTpXUG+CYhoYtZOTpuhfjQthg6ADfzCiOFltiMS52MmLJjrik1gKlsbZ3nBq57atf8j6v55mfplVUhEszMaMqG8P9JWhHOUASuWu+xUXyOakO/P7sqrKdSC8vssWcZ83pP7guXOyo8QmEvaKUZeFEp7EbJcZJS9bqtYgZGqJBthlMJgkproLDHJy8J0u9HdwnHcTVSGLL6NDFP3+A0Qnq53ewKBgQDX8t3zL000K39Ytpq0Mu26aJp+stQQPO/0IqVfJN/nUSoVOTt2qrBM0dGZdGfjf9tT0xU8VqKsS+gTq8e1iRiGD0Yp4AN38uSDdi8dba83y9NuskwgkqNk7k3UiYjB/koHW8WBWv9pE8yHDddIsy7k1Bfm2SWAOw67tLXuuCM47wKBgQDB5gzXfbYuRaFQML/DzAd7E5dIUS9CdoC5Ht1ieV3c/eBigb6sLfIxIymmZ7Ma9yeS9GK/p5C6cSixDavKGW6VHTAFhKgMTdxy3nFAjyXzzle+v2ypqH5ZTNnAyWi+PZqG8Lw21mldPsAoTRFpXaEP8rDiXRY9vHBMDW5uNyixWwKBgGB0Ad6Uyg77Pq4JIaBK/xO7lQXyKfX2wdZxgxu0BK30+q7wGTcvlf852DyKWbyrZvNR3LJOn+oFHWtr1o+m5GU8fUJG5EW3H4n4R6MFUrXBPHa8/HOwC3sRVYIQzByZz8bpnpXgZyQvy7Km4/l8zv02HlbltnJH7pS4amptpI3RAoGAVcgzMjrZmIsRnOqUTEk9ngPC0CmqoNrQhBXVl7VeA2EGHk6MTpxdI8QMryP9pxZlGayo62V0sCdT+1CzCcxKkgnBrw9LUXY461DiBc/O2JgXVbpWlpCGpXdMdvAkONYEQWLLwe8F2kzisnG2HElh8i5Kdzr7lgCCJgNjMbuRczUCgYAcJz/5hFRSRyKdJkyP43ZZK6wNSfQlG+7Qq5x5n43UMmR1gylDw0J+zh2/JmZCcrqhXoPVTaN+CtRvCnNT5GnMj+aCQbod67xHf3bLnCZlyHWJtZwUkNuEICurMHvbXyxJFZc33VeXoC3msfh8WHLw2hMs5LXDWe/UvafB3o4ecA==';
        let privateKey;
        const SPKIKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo5AoXOiQxTfrxmDhWexEWHYd8CnLpbwvbHnO45aoBCCZrCfXbOveHydFxAQxOJ7XGyL2ADrM04P5leHP4dMsPdckcjClGzvBHjr9PZrzhXdtVM3iE4yuQHCgSKhjmtgTAhOWfxZ4eac8fGvXmjGJbngdk1Rc2DoKxuyeCdELwmap6SgaY6AwcgaxhUWFN2ZVaLwUQfVIKjK6zY0sYm9RdkOOICl8d6XXxszuwvF2z3IpGpe7zricDgPBK5wZcJqkon+3AejgjPQ9gAoyzAhsX0rocTa/mzkjGWXtWqi4e32U4AJ2qSHKLQfdhVXYUOoV+8j5ylPTUEp7nziaDTp79QIDAQAB';
        let publicKey;
        const plainText = 'Hello Martians!';
        const cipherText = 'aGUPobvIYCsTtZlQxQ/z8tCpBEiTKNBcZ3wtt6dlTlSwJYT9TyB9lh3LXh7nYtBn/idJ0YoHCgkgt1pO9u0xHnhBzRJVllgCrGN30y3rwO+mz7xr+z/nyqVyrsiOsUPfbS4ojrUszVAxbXLdyq2bVgQ4wV4suBTWJ/41Cx/Tvhlj6C7lph4cSj+R+SOArayRIAcwgDgAY+ThY4/+1JWqH4GNq2QmGplwfoDVvVYDMfepUN6K1E7APnELKNvz89s6/z+n3GTtrntx5Tbos6aD3hafrPbESj/fbK7gaVdUcM6VhJy4RBtDzg0Y4u4Q/hg0W9u+sjZEnHR6s83t4syM7w==';
        let cipherResult;

        describe('getKeyFromSPKI', () => {
            it('should import a SPKI key correctly', (done) => {
                crypto.getKeyFromSPKI(SPKIKey)
                    .then((pk) => {
                        publicKey = pk;
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getSPKIFromKey', () => {
            it('should export key to SPKIKey correctly', (done) => {
                crypto.getSPKIFromKey(publicKey)
                    .then((SPKI) => {
                        expect(SPKI).to.equal(SPKIKey);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getKeyFromPKCS8', () => {
            it('should import PKCS8 key correctly', (done) => {
                crypto.getKeyFromPKCS8(PKCS8Key)
                    .then((pk) => {
                        privateKey = pk;
                        done();
                    })
                    .catch(done);
            });
        });

        describe('getPKCS8FromKey', () => {
            it('should export key to PKCS8 correctly', (done) => {
                crypto.getPKCS8FromKey(privateKey)
                    .then((PKCS8) => {
                        expect(PKCS8).to.equal(PKCS8Key);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('asymEncryptString', () => {
            it(`should encrypt ${plainText} to ${cipherText}`, (done) => {
                crypto.asymEncryptString(SPKIKey, plainText)
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
                    crypto.asymDecryptString(PKCS8Key, cipherText),
                    crypto.asymDecryptString(PKCS8Key, cipherResult),
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
