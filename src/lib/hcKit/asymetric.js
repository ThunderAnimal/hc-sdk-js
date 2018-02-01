const crypto = window.crypto || window.msCrypto;

// iv: Is initialization vector. It must be 16 bytes
const iv = crypto.getRandomValues(new Uint8Array(16));

const cryptoWrapper = {
    convertStringToArrayBufferView: (str) => {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }

        return bytes;
    },

    convertArrayBufferViewtoString: (arrayBuffer) => {
        let str = '';
        for (let i = 0; i < arrayBuffer.byteLength; i++) {
            str += String.fromCharCode(arrayBuffer[i]);
        }

        return str;
    },

    generatePublicPrivateKeyPair: () => {
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
            .catch(console.log);
    },

    generateSymmetricKey: () => {
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
            .catch(console.log);
    },

    exportKey: (key) => {
        return crypto.subtle.exportKey('jwk', key);
    },

    encryptArrayBuffer: (key, arrayBuffer) => {
        return crypto.subtle.encrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, arrayBuffer,
        )
            .then(result => new Uint8Array(result))
            .catch(console.log);
    },

    decryptArrayBuffer: (key, arrayBuffer) => {
        return crypto.subtle.decrypt(
            {
                name: key.algorithm.name,
                iv,
            }, key, arrayBuffer)
            .then(result => new Uint8Array(result))
            .catch(console.log);
    },
};

export default cryptoWrapper;

/*
const string = 'superSecretMessage';
const asymKeys = cryptoWrapper.generatePublicPrivateKeyPair();
asymKeys
    .then((keys) => {
        console.log('ASYMMETRIC');
        console.log(keys);
        console.log(string);
        const plainArrayBuffer = cryptoWrapper.convertStringToArrayBufferView(string);
        console.log(plainArrayBuffer);
        return cryptoWrapper.encryptArrayBuffer(keys.publicKey, plainArrayBuffer)
            .then((encryptedArrayBuffer) => {
                console.log(encryptedArrayBuffer)
                console.log(cryptoWrapper.convertArrayBufferViewtoString(encryptedArrayBuffer));
                return cryptoWrapper.decryptArrayBuffer(keys.privateKey, encryptedArrayBuffer);
            })
            .then((decryptedArrayBuffer) => {
                console.log(decryptedArrayBuffer);
                const decryptedString = cryptoWrapper.convertArrayBufferViewtoString(decryptedArrayBuffer);
                console.log(decryptedString)
                return decryptedString;
            })
            .then(() => cryptoWrapper.exportKey(keys.publicKey))
            .then(console.log)
            .then(() => cryptoWrapper.exportKey(keys.privateKey))
            .then(console.log);
    })
    .then(() => cryptoWrapper.generateSymmetricKey())
    .then((key) => {
        console.log('SYMMETRIC');
        console.log(key);
        console.log(string);
        const plainArrayBuffer = cryptoWrapper.convertStringToArrayBufferView(string);
        console.log(plainArrayBuffer);
        cryptoWrapper.encryptArrayBuffer(key, plainArrayBuffer)
            .then((encryptedArrayBuffer) => {
                console.log(encryptedArrayBuffer);
                console.log(cryptoWrapper.convertArrayBufferViewtoString(encryptedArrayBuffer));
                return cryptoWrapper.decryptArrayBuffer(key, encryptedArrayBuffer);
            })
            .then((decryptedArrayBuffer) => {
                console.log(decryptedArrayBuffer);
                const decryptedString = cryptoWrapper.convertArrayBufferViewtoString(decryptedArrayBuffer);
                console.log(decryptedString);
                return decryptedString;
            })
            .then(() => cryptoWrapper.exportKey(key))
            .then(console.log);
    });
    */