const crypto = window.crypto || window.msCrypto;

const keyTypes = {
    COMMON_KEY: 'ck',
    DATA_KEY: 'dk',
    PASSWORD_KEY: 'pk',
    ATTACHMENT_KEY: 'ak',
    TAG_ENCRYPTION_KEY: 'tek',
    APP: {
        PRIVATE_KEY: 'apriv',
        PUBLIC_KEY: 'apub',
    },
    USER: {
        PRIVATE_KEY: 'upriv',
        PUBLIC_KEY: 'upub',
    },
};

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
    salt: new Uint8Array(16),
    iterations: 100,
    hash: 'SHA-256',
};

const TEK_IV = new Uint8Array(16).fill(0);

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
 * Import from base64 encoded raw key to CryptoKey.
 *
 * @param {String} base64Key - base64 encoded key
 * @returns {Promise} Resolves to the key as a CryptoKey.
 */
const importSymKeyFromBase64 = (base64Key) => {
    const alg = AES_CBC;

    return crypto.subtle.importKey(
        'raw',
        convertBase64ToArrayBufferView(base64Key),
        alg,
        true,
        ['encrypt', 'decrypt'],
    );
};


/**
 * Export symmetric CryptoKey as base64 encoded raw key.
 *
 * @param {Object} cryptoKey - the cryptoKey that should be exported
 * @returns {Promise} Resolves to the key as a base64 encoded String.
 */
const exportSymKeyToBase64 = cryptoKey =>
    crypto.subtle.exportKey('raw', cryptoKey)
        .then(byteKey => new Uint8Array(byteKey))
        .then(convertArrayBufferViewToBase64);


/**
 * Import private CryptoKey from base64 encoded PKCS8.
 *
 * @param {String} key - the base64 encoded PKCS8 string
 * @returns {Promise} Resolves to the private key as a CryptoKey.
 */
const importPrivateKeyFromPKCS8 = (PKCS8) => {
    const alg = RSA_OAEP;

    return crypto.subtle.importKey(
        'pkcs8',
        convertBase64ToArrayBufferView(PKCS8),
        alg,
        true,
        ['decrypt'],
    );
};


/**
 * Export private CryptoKey to base64 encoded PKCS8.
 *
 * @param {Object} cryptoKey - the cryptoKey that should be exported
 * @returns {Promise} Resolves to the key as a base64 encoded String.
 */
const exportPrivateKeyToPKCS8 = cryptoKey =>
    crypto.subtle.exportKey('pkcs8', cryptoKey)
        .then(PKCS8 => new Uint8Array(PKCS8))
        .then(convertArrayBufferViewToBase64);


/**
 * Import public CryptoKey from base64 encoded SPKI.
 *
 * @param {String} SPKI - the base64 encoded SPKI
 * @returns {Promise} Resolves to the public key as a CryptoKey.
 */
const importPublicKeyFromSPKI = (SPKI) => {
    const alg = RSA_OAEP;

    return crypto.subtle.importKey(
        'spki',
        convertBase64ToArrayBufferView(SPKI),
        alg,
        true,
        ['encrypt'],
    );
};


/**
 * Export public CryptoKey to base64 encoded SPKI.
 *
 * @param {Object} cryptoKey - the key that should be exported
 * @returns {Promise} Resolves to the key as a base64 encoded String.
 */
const exportPublicKeyToSPKI = cryptoKey =>
    crypto.subtle.exportKey('spki', cryptoKey)
        .then(SPKI => new Uint8Array(SPKI))
        .then(convertArrayBufferViewToBase64);


const importKey = (key) => {
    switch (key.t) {
    case keyTypes.COMMON_KEY:
    case keyTypes.DATA_KEY:
    case keyTypes.ATTACHMENT_KEY:
    case keyTypes.TAG_ENCRYPTION_KEY:
    case keyTypes.PASSWORD_KEY:
        return importSymKeyFromBase64(key.sym);
    case keyTypes.USER.PRIVATE_KEY:
    case keyTypes.APP.PRIVATE_KEY:
        return importPrivateKeyFromPKCS8(key.priv);
    case keyTypes.USER.PUBLIC_KEY:
    case keyTypes.APP.PUBLIC_KEY:
        return importPublicKeyFromSPKI(key.pub);
    default:
        throw new Error('invalid key type');
    }
};

const exportKey = (key, type) => {
    switch (type) {
    case keyTypes.COMMON_KEY:
    case keyTypes.DATA_KEY:
    case keyTypes.ATTACHMENT_KEY:
    case keyTypes.TAG_ENCRYPTION_KEY:
    case keyTypes.PASSWORD_KEY:
        return exportSymKeyToBase64(key)
            .then(base64 => ({
                t: type,
                v: 1,
                sym: base64,
            }));
    case keyTypes.USER.PRIVATE_KEY:
    case keyTypes.APP.PRIVATE_KEY:
        return exportPrivateKeyToPKCS8(key)
            .then(base64 => ({
                t: type,
                v: 1,
                priv: base64,
            }));
    case keyTypes.USER.PUBLIC_KEY:
    case keyTypes.APP.PUBLIC_KEY:
        return exportPublicKeyToSPKI(key)
            .then(base64 => ({
                t: type,
                v: 1,
                pub: base64,
            }));
    default:
        throw new Error('invalid key type');
    }
};

const mergeUint8Arrays = (arr1, arr2) => {
    const merge = new Uint8Array(arr1.length + arr2.length);
    merge.set(arr1);
    merge.set(arr2, arr1.length);
    return merge;
};

/**
 * Symmetric encryption of data with hcKey
 *
 * @param {Object} hcKey - The hcKey representation of the key
 * @param {ArrayBufferView} data that should be encrypted
 * @returns {Promise} Resolves to encrypted data as an ArrayBufferView
 */
const symEncrypt = (hcKey, data) => {
    const iv = hcKey.t === keyTypes.TAG_ENCRYPTION_KEY ?
        TEK_IV :
        crypto.getRandomValues(new Uint8Array(16));
    return importKey(hcKey)
        .then(key => crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data,
        ))
        .then(result => mergeUint8Arrays(iv, new Uint8Array(result)));
};

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
const symDecrypt = (hcKey, ivData) => {
    const iv = ivData.slice(0, 16);
    const data = ivData.slice(16, ivData.length);
    return importKey(hcKey)
        .then(key => crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, data))
        .then(result => new Uint8Array(result));
};

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
        .then(key => exportKey(key, keyTypes.PASSWORD_KEY));

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
            exportKey(keyPair.publicKey, type.PUBLIC_KEY),
            exportKey(keyPair.privateKey, type.PRIVATE_KEY),
        ]))
        .then(([publicKey, privateKey]) => ({ publicKey, privateKey }));

const hcCrypto = {
    deriveKey,
    generateSymKey,
    generateAsymKeyPair,

    importKey,
    exportKey,

    importSymKeyFromBase64,
    exportSymKeyToBase64,

    importPrivateKeyFromPKCS8,
    exportPrivateKeyToPKCS8,

    importPublicKeyFromSPKI,
    exportPublicKeyToSPKI,

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

    keyTypes,
};

export default hcCrypto;
