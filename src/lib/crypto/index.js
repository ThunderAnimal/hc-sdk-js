const crypto = window.crypto || window.msCrypto;

const iv = new Uint8Array([124, 217, 143, 93, 158, 16, 65, 155, 218, 47, 56, 37, 231, 77, 126, 88]);

// ALGORITHMS
const AES_CBC = {
    name: 'AES-CBC',
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
};

const jwkToWebCrypto = {
    A256CBC: AES_CBC,
    'RSA-OAEP-256': RSA_OAEP,
};

const convertStringToArrayBufferView = (str) => {
    const bytes = new Uint8Array(str.length);

    for (let i = 0; i < str.length; i += 1) {
        bytes[i] = str.charCodeAt(i);
    }

    return bytes;
};

const convertBase64ToArrayBufferView = base64String =>
    convertStringToArrayBufferView(atob(base64String));

const convertObjectToArrayBufferView = object =>
    convertStringToArrayBufferView(JSON.stringify(object));

const convertArrayBufferViewToString = (arrayBufferView) => {
    let str = '';

    for (let i = 0; i < arrayBufferView.byteLength; i += 1) {
        str += String.fromCharCode(arrayBufferView[i]);
    }

    return str;
};

const convertArrayBufferViewToBase64 = arrayBufferView =>
    btoa(convertArrayBufferViewToString(arrayBufferView));

const convertBlobToArrayBufferView = blob =>
    new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            resolve(new Uint8Array(event.target.result));
        };
        fileReader.readAsArrayBuffer(blob);
    });

/**
 * Transformation from jwk to key.
 *
 * @param {Object} jwk - The jwk representation of the key
 * @returns {Promise} Resolves to the key as a CryptoKey.
 */
const getKeyFromJWK = (jwk) => {
    const alg = jwkToWebCrypto[jwk.alg];

    return crypto.subtle.importKey(
        'jwk',
        jwk,
        alg,
        true,
        jwk.key_ops,
    );
};

/**
 * Transformation from jwk to key.
 *
 * @param {CryptoKey} key - the key that should be exported
 * @returns {Promise} Resolves to the key as an jwk object.
 */
const getJWKFromKey = key =>
    crypto.subtle.exportKey('jwk', key);

/**
 * Symmetric encryption of data with JWK
 *
 * @param {Object} jwk - The jwk representation of the key
 * @param {ArrayBufferView} data that should be encrypted
 * @returns {Promise} Resolves to encrypted data as an ArrayBufferView
 */
const symEncrypt = (jwk, data) =>
    getKeyFromJWK(jwk)
        .then(key => crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data,
        ))
        .then(result => new Uint8Array(result));


const symEncryptString = (jwk, string) =>
    symEncrypt(jwk, convertStringToArrayBufferView(string))
        .then(convertArrayBufferViewToBase64);

const symEncryptObject = (jwk, object) =>
    symEncryptString(jwk, JSON.stringify(object));

const symEncryptBlob = (jwk, blob) =>
    convertBlobToArrayBufferView(blob)
        .then(arrayBufferString => symEncrypt(jwk, arrayBufferString));


/**
 * Symmetric decryption of data with JWK
 *
 * @param {Object} jwk that specifies the crypto primitives
 * @param {ArrayBufferView} encrypted data that should be decrypted
 * @returns {Promise} Resolves to plain data as an ArrayBufferView
 */
const symDecrypt = (jwk, data) =>
    getKeyFromJWK(jwk)
        .then(key => crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data))
        .then(result => new Uint8Array(result));

const symDecryptString = (jwk, base64String) =>
    symDecrypt(jwk, convertBase64ToArrayBufferView(base64String))
        .then(convertArrayBufferViewToString);

const symDecryptObject = (jwk, base64String) =>
    symDecryptString(jwk, base64String).then(JSON.parse);

/**
 * Creates key out of given String (aka password)
 *
 * @param {String} masterKey
 * @returns {Promise} Resolves to from masterKey derived key as a CryptoKey
 */
const deriveKey = masterKey =>
    crypto.subtle.importKey(
        'raw',
        masterKey,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey'],
    )
        .then(key => crypto.subtle.deriveKey(
            PBKDF2,
            key,
            AES_CBC,
            true,
            ['encrypt', 'decrypt'],
        ))
        .then(getJWKFromKey);

/**
 * Asymmetric encryption of data with JWK
 *
 * @param {Object} publicKeyJWK - jwk representation of the a public key
 * @param {ArrayBufferView} data that will be encrypted
 * @returns {Promise} Resolves to encrypted data as an ArrayBufferView
 */
const asymEncrypt = (publicKeyJWK, data) =>
    getKeyFromJWK(publicKeyJWK)
        .then(key => crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data,
        ))
        .then(result => new Uint8Array(result));

const asymEncryptString = (publicKeyJWK, string) =>
    asymEncrypt(publicKeyJWK, convertStringToArrayBufferView(string));

/**
 * Asymmetric decryption of data with JWK
 *
 * @param {JWK} privateKeyJWK
 * @param {ArrayBufferView} data
 * @returns {Promise} Resolves to decrypted data as an ArrayBufferView
 */
const asymDecrypt = (privateKeyJWK, data) =>
    getKeyFromJWK(privateKeyJWK)
        .then(key => crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data))
        .then(result => new Uint8Array(result));

const asymDecryptString = (privateKeyJWK, base64String) =>
    asymDecrypt(privateKeyJWK, base64String)
        .then(convertArrayBufferViewToString);

/**
 * Creates a random symmetric key.
 *
 * @returns {Promise} Resolves to a symmetric key as a jwk object
 */
const generateSymKey = () =>
    // Parameters:
    // 1. Symmetric Encryption algorithm name and its requirements
    // 2. Boolean indicating extractable. which indicates whether or not the raw keying
    //    material may be exported by the application
    //    (http://www.w3.org/TR/WebCryptoAPI/#dfn-CryptoKey-slot-extractable)
    // 3. Usage of the key. (http://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface-types)
    crypto.subtle.generateKey(
        {
            name: 'AES-CBC',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
    )
        .then(getJWKFromKey);

/**
 * Creates a random public-private key pair
 *
 * @returns {Promise} Resolves to an object containing a public and a private key as jwk objects
 */
const generateAsymKeyPair = () =>
    // Parameters:
    // 1. Asymmetric Encryption algorithm name and its requirements
    // 2. Boolean indicating extractable which indicates whether or not the raw keying
    //    material may be exported by the application
    //    (http://www.w3.org/TR/WebCryptoAPI/#dfn-CryptoKey-slot-extractable)
    // 3. Usage of the keys. (http://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface-types)
    crypto.subtle.generateKey(
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

const hcCrypto = {
    deriveKey,
    generateSymKey,
    generateAsymKeyPair,

    getKeyFromJWK,
    getJWKFromKey,

    symEncrypt,
    symEncryptString,
    symEncryptObject,
    symEncryptBlob,
    symDecrypt,
    symDecryptString,
    symDecryptObject,

    asymEncrypt,
    asymEncryptString,
    asymDecrypt,
    asymDecryptString,

    convertStringToArrayBufferView,
    convertBase64ToArrayBufferView,
    convertObjectToArrayBufferView,
    convertBlobToArrayBufferView,
    convertArrayBufferViewToString,
};

export default hcCrypto;
