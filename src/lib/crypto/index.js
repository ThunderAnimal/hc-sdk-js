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
 * Transformation from base64 encoded key to CryptoKey.
 *
 * @param {String} key - base64 encoded key
 * @returns {Promise} Resolves to the key as a CryptoKey.
 */
const getSymKeyFromString = (key) => {
    const alg = AES_CBC;

    return crypto.subtle.importKey(
        'raw',
        convertBase64ToArrayBufferView(key),
        alg,
        true,
        ['encrypt', 'decrypt'],
    );
};


/**
 * Transformation from CryptoKey to base64 encoded String.
 *
 * @param {Object} key - the key that should be exported
 * @returns {Promise} Resolves to the key as an base64 encoded String.
 */
const getStringFromSymKey = key =>
    crypto.subtle.exportKey('raw', key)
        .then(byteKey => new Uint8Array(byteKey))
        .then(convertArrayBufferViewToBase64);


const getPrivateKeyFromPKCS8 = (PKCS8) => {
    const alg = RSA_OAEP;

    return crypto.subtle.importKey(
        'pkcs8',
        convertBase64ToArrayBufferView(PKCS8),
        alg,
        true,
        ['decrypt'],
    );
};

const getPKCS8FromPrivateKey = key =>
    crypto.subtle.exportKey('pkcs8', key)
        .then(PKCS8 => new Uint8Array(PKCS8))
        .then(convertArrayBufferViewToBase64);

const getPublicKeyFromSPKI = (SPKI) => {
    const alg = RSA_OAEP;

    return crypto.subtle.importKey(
        'spki',
        convertBase64ToArrayBufferView(SPKI),
        alg,
        true,
        ['encrypt'],
    );
};

const getSPKIFromPublicKey = key =>
    crypto.subtle.exportKey('spki', key)
        .then(SPKI => new Uint8Array(SPKI))
        .then(convertArrayBufferViewToBase64);

const importKey = (key) => {
    switch (key.t) {
    case 'ck': // commonKey
    case 'dk': // dataKey
    case 'ak': // attachmentKey
        return getSymKeyFromString(key.sym);
    case 'privU': // userPrivateKey
    case 'privA': // appPrivateKey
        return getPrivateKeyFromPKCS8(key.priv);
    case 'pubU': // userPublicKey
    case 'pubA': // appPublicKey
        return getPublicKeyFromSPKI(key.pub);
    default:
        throw new Error('invalid key type');
    }
};

const exportKey = (key, type) => {
    switch (type) {
    case 'ck': // commonKey
    case 'dk': // dataKey
    case 'ak': // attachmentKey
        return getStringFromSymKey(key)
            .then(keyString => ({
                t: type,
                v: 1,
                sym: keyString,
            }));
    case 'privU': // userPrivateKey
    case 'privA': // appPrivateKey
        return getPKCS8FromPrivateKey(key)
            .then(keyString => ({
                t: type,
                v: 1,
                priv: keyString,
            }));
    case 'pubU': // userPublicKey
    case 'pubA': // appPublicKey
        return getSPKIFromPublicKey(key)
            .then(keyString => ({
                t: type,
                v: 1,
                pub: keyString,
            }));
    default:
        throw new Error('invalid key type');
    }
};

/**
 * Symmetric encryption of data with hcKey
 *
 * @param {Object} hcKey - The hcKey representation of the key
 * @param {ArrayBufferView} data that should be encrypted
 * @returns {Promise} Resolves to encrypted data as an ArrayBufferView
 */
const symEncrypt = (hcKey, data) =>
    importKey(hcKey)
        .then(key => crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data,
        ))
        .then(result => new Uint8Array(result));


const symEncryptString = (hcKey, string) =>
    symEncrypt(hcKey, convertStringToArrayBufferView(string))
        .then(convertArrayBufferViewToBase64);

const symEncryptObject = (hcKey, object) =>
    symEncryptString(hcKey, JSON.stringify(object));

const symEncryptBlob = (hcKey, blob) =>
    convertBlobToArrayBufferView(blob)
        .then(arrayBufferString => symEncrypt(hcKey, arrayBufferString));


/**
 * Symmetric decryption of data with hcKey
 *
 * @param {Object} hcKey that specifies the crypto primitives
 * @param {ArrayBufferView} encrypted data that should be decrypted
 * @returns {Promise} Resolves to plain data as an ArrayBufferView
 */
const symDecrypt = (hcKey, data) =>
    importKey(hcKey)
        .then(key => crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data))
        .then(result => new Uint8Array(result));

const symDecryptString = (hcKey, base64String) =>
    symDecrypt(hcKey, convertBase64ToArrayBufferView(base64String))
        .then(convertArrayBufferViewToString);

const symDecryptObject = (hcKey, base64String) =>
    symDecryptString(hcKey, base64String).then(JSON.parse);

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
        .then(exportKey);

/**
 * Asymmetric encryption of data with hcKey
 *
 * @param {Object} hcPublicKey - hcKey representation of the a public key
 * @param {ArrayBufferView} data that will be encrypted
 * @returns {Promise} Resolves to encrypted data as an ArrayBufferView
 */
const asymEncrypt = (hcPublicKey, data) =>
    importKey(hcPublicKey)
        .then(key => crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data,
        ))
        .then(result => new Uint8Array(result));

const asymEncryptString = (publicKeySPKI, string) =>
    asymEncrypt(publicKeySPKI, convertStringToArrayBufferView(string))
        .then(convertArrayBufferViewToBase64);

/**
 * Asymmetric decryption of data with hcKey
 *
 * @param {Object} hcPrivateKey
 * @param {ArrayBufferView} data
 * @returns {Promise} Resolves to decrypted data as an ArrayBufferView
 */
const asymDecrypt = (hcPrivateKey, data) =>
    importKey(hcPrivateKey)
        .then(key => crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data))
        .then(result => new Uint8Array(result));

const asymDecryptString = (hcPrivateKey, base64String) =>
    asymDecrypt(hcPrivateKey, convertBase64ToArrayBufferView(base64String))
        .then(convertArrayBufferViewToString);

/**
 * Creates a random symmetric key.
 *
 * @param {String} type of the key
 * @returns {Promise} Resolves to a symmetric key as a hcKey object
 */
const generateSymKey = type =>
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
        .then(key => exportKey(key, type));

/**
 * Creates a random public-private key pair
 * @param {String} type - type of the keypair 'A' for App, 'U' for User
 * @returns {Promise} Resolves to an object containing a public and a private key as hcKey objects
 */
const generateAsymKeyPair = type =>
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
            exportKey(keyPair.publicKey, `pub${type}`),
            exportKey(keyPair.privateKey, `priv${type}`),
        ]))
        .then(hcKeys => ({
            publicKey: hcKeys[0],
            privateKey: hcKeys[1],
        }));

const hcCrypto = {
    deriveKey,
    generateSymKey,
    generateAsymKeyPair,

    importKey,
    exportKey,

    getSymKeyFromString,
    getStringFromSymKey,

    getPrivateKeyFromPKCS8,
    getPKCS8FromPrivateKey,

    getPublicKeyFromSPKI,
    getSPKIFromPublicKey,

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
    convertArrayBufferViewToBase64,
};

export default hcCrypto;
