import makeJWK from './jwk';

// eslint-disable-next-line no-unused-vars
const JWK = Object;

/**
 * Symmetric encryption of data with JWK
 *
 * @param {JWK} jwk that specifies the crypto primitives
 * @param {ArrayBuffer} data that should be encrypted
 * @returns {ArrayBuffer} encrypted data
 */
const symEncrypt = (jwk, data) => {};

/**
 * Symmetric decryption of data with JWK
 *
 * @param {JWK} jwk that specifies the crypto primitives
 * @param {ArrayBuffer} data that should be decrypted
 * @returns {ArrayBuffer} decrypted data
 */
const symDecrypt = (jwk, data) => {};

// helpers
// const symencrypt = (key: string, data: string, alg?: Algorithm) => {}
// const symdecrypt = (key: string, data: string, alg?: Algorithm) => {}

/**
 * Creates key out of given String (aka password)
 * @param {JWK} jwk
 * @param {String} masterKey
 * @returns {ArrayBuffer} secret key
 */
const deriveKey = (jwk, masterKey) => {};

/**
 * Asymmetric encryption of data with JWK
 *
 * @param {JWK} publicKeys that contains all the public keys that should have access
 * @param {JWK} commonKey that will be encrypted with the keys from
 * @returns {ArrayBuffer} distributed key
 */
const asymEncrypt = (publicKeys, commonKey) => {};

/**
 * Asymmetric decryption of data with JWK
 *
 * @param {JWK} privateKey
 * @param {ArrayBuffer} distributedKey
 * @returns {JWK} common key
 */
const asymDecrypt = (privateKey, distributedKey) => {};

// helpers
// asymencrypt(pubkey: string[], commonkey: string, alg?: Algorithm)
// asymdecrypt(privkey: string, distributedKey: string, alg?: Algorithm)

/**
 * Creates a random symmetric key.
 *
 * @param {JWK} jwk
 * @returns {JWK} sym key
 */
const generateSymKey = (jwk = {}) => {};

/**
 * Creates a random public-private key pair
 *
 * @param {JWK} jwk
 * @returns {JWK} key pair
 */
const generateAsymKeys = (jwk = {}) => {};

const crypto = {
    makeJWK,
    symEncrypt,
    symDecrypt,
    asymEncrypt,
    asymDecrypt,
    deriveKey,
    generateSymKey,
    generateAsymKeys,
};

export default crypto;
