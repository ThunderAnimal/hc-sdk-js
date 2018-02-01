import makeJWK from './jwk';

const crypto = window.crypto || window.msCrypto;

// ALGORITHMS
const AES_GCM = {
    name: 'AES-GCM',
    length: 256,
};

const RSA_OAEP = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: { name: 'SHA-256' },
};

const PBKDF2 = {
    name: 'PBKDF2',
    salt: crypto.getRandomValues(new Uint8Array(16)),
    iterations: 100,
    hash: 'SHA-256',
}

// iv: Is initialization vector. It must be 16 bytes
const iv = crypto.getRandomValues(new Uint8Array(16));

// eslint-disable-next-line no-unused-vars
const JWK = Object;

const convertStringToArrayBuffer = (str) => {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i += 1) {
        bytes[i] = str.charCodeAt(i);
    }

    return bytes;
};

const convertArrayBufferToString = (arrayBuffer) => {
    let str = '';
    for (let i = 0; i < arrayBuffer.byteLength; i += 1) {
        str += String.fromCharCode(arrayBuffer[i]);
    }

    return str;
};

const getKeyFromJWK = (jwk) => {
    let alg;
    if (jwk.alg === 'A256GCM') alg = AES_GCM;
    if (jwk.alg === 'RSA-OAEP-256') alg = RSA_OAEP;
    return crypto.subtle.importKey(
        'jwk',
        jwk,
        alg,
        true,
        jwk.key_ops,
    );
};

const getJWKFromKey = (key) => {
    return crypto.subtle.exportKey('jwk', key);
};

/**
 * Symmetric encryption of data with JWK
 *
 * @param {JWK} jwk that specifies the crypto primitives
 * @param {ArrayBuffer} data that should be encrypted
 * @returns {ArrayBuffer} encrypted data
 */
const symEncrypt = (jwk, data) => {
    return getKeyFromJWK(jwk)
        .then(key => crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data,
        ))
        .then(result => new Uint8Array(result));
};

/**
 * Symmetric decryption of data with JWK
 *
 * @param {JWK} jwk that specifies the crypto primitives
 * @param {ArrayBuffer} data that should be decrypted
 * @returns {ArrayBuffer} decrypted data
 */
const symDecrypt = (jwk, data) => {
    return getKeyFromJWK(jwk)
        .then(key => crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data))
        .then(result => new Uint8Array(result));
};

// helpers
// const symencrypt = (key: string, data: string, alg?: Algorithm) => {}
// const symdecrypt = (key: string, data: string, alg?: Algorithm) => {}

/**
 * Creates key out of given String (aka password)
 * @param {JWK} jwk
 * @param {String} masterKey
 * @returns {ArrayBuffer} secret key
 */
const deriveKey = (string) => {
    return crypto.subtle.importKey(
        'raw',
        string,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey'],
    )
        .then(key => crypto.subtle.deriveKey(
            PBKDF2,
            key,
            AES_GCM,
            true,
            ['encrypt', 'decrypt'],
        ))
        .then(getJWKFromKey);
};

/**
 * Asymmetric encryption of data with JWK
 *
 * @param {JWK} publicKeys that contains all the public keys that should have access
 * @param {JWK} value that will be encrypted with the keys from
 * @returns {ArrayBuffer} distributed key
 */
const asymEncrypt = (publicKeyJWK, data) => {
    return getKeyFromJWK(publicKeyJWK)
        .then(key => crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data,
        ))
        .then(result => new Uint8Array(result));
};

/**
 * Asymmetric decryption of data with JWK
 *
 * @param {JWK} privateKey
 * @param {ArrayBuffer} distributedKey
 * @returns {JWK} common key
 */
const asymDecrypt = (privateKeyJWK, data) => {
    return getKeyFromJWK(privateKeyJWK)
        .then(key => crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data))
        .then(result => new Uint8Array(result));
};

// helpers
// asymencrypt(pubkey: string[], commonkey: string, alg?: Algorithm)
// asymdecrypt(privkey: string, distributedKey: string, alg?: Algorithm)

/**
 * Creates a random symmetric key.
 *
 * @returns {JWK} sym key
 */
const generateSymKey = () => {
    // Parameters:
    // 1. Symmetric Encryption algorithm name and its requirements
    // 2. Boolean indicating extractable. which indicates whether or not the raw keying
    //    material may be exported by the application
    //    (http://www.w3.org/TR/WebCryptoAPI/#dfn-CryptoKey-slot-extractable)
    // 3. Usage of the key. (http://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface-types)
    return crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
    )
        .then(getJWKFromKey);
};

/**
 * Creates a random public-private key pair
 *
 * @returns {JWK} key pair
 */
const generateAsymKeyPair = () => {
    // Parameters:
    // 1. Asymmetric Encryption algorithm name and its requirements
    // 2. Boolean indicating extractable which indicates whether or not the raw keying
    //    material may be exported by the application
    //    (http://www.w3.org/TR/WebCryptoAPI/#dfn-CryptoKey-slot-extractable)
    // 3. Usage of the keys. (http://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface-types)
    return crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: { name: 'SHA-256' },
        },
        true,
        ['encrypt', 'decrypt'],
    )
        .then(keyPair => Promise.all([
            getJWKFromKey(keyPair.publicKey),
            getJWKFromKey(keyPair.privateKey),
        ]))
        .then(jwks => ({
            publicKey: jwks[0],
            privateKey: jwks[1],
        }));
};

const hcCrypto = {
    makeJWK,
    symEncrypt,
    symDecrypt,
    asymEncrypt,
    asymDecrypt,
    deriveKey,
    generateSymKey,
    generateAsymKeyPair,

    getKeyFromJWK,
    getJWKFromKey,
    convertStringToArrayBuffer,
    convertArrayBufferToString,
};

export default hcCrypto;
