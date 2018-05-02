import hcCrypto from '../lib/crypto';
import userService from './userService';

// createEncryptData :: encrypt<Data> => Promise(JWK) -> Data ->
//      Promise([ String/ArrayBufferView, String ])
const createEncryptData = encryptionMethod => commonKeyPromise =>
    (data, givenEncryptedDataKeyPromise) => {
        const dataKeyPromise = Promise.all([commonKeyPromise, givenEncryptedDataKeyPromise])
            .then(([commonKey, encryptedDataKey]) => {
                if (encryptedDataKey) {
                    return hcCrypto.symDecryptObject(commonKey, encryptedDataKey);
                }
                return hcCrypto.generateSymKey(hcCrypto.keyTypes.DATA_KEY);
            });
        return Promise.all([commonKeyPromise, dataKeyPromise])
            .then(([commonKey, dataKey]) => {
                const encryptedDataKeyPromise = hcCrypto.symEncryptObject(commonKey, dataKey);
                const encryptedDataPromise = encryptionMethod(dataKey, data);

                return Promise.all([
                    encryptedDataPromise,
                    encryptedDataKeyPromise,
                ]);
            });
    };

const createEncryptArrayBufferView = createEncryptData(hcCrypto.symEncrypt);

const createEncryptBlobs = createEncryptData((dataKey, blobArray) =>
    Promise.all(blobArray.map(blob => hcCrypto.symEncryptBlob(dataKey, blob))));

const createEncryptString = createEncryptData(hcCrypto.symEncryptString);

const createEncryptObject = createEncryptData(hcCrypto.symEncryptObject);

// createDecryptData :: Promise(JWK) -> String, ArrayBuffer -> Promise(ArrayBuffer)
const createDecryptData = commonKeyPromise => (encryptedDataKey, encryptedData) =>
    commonKeyPromise
        .then(commonKey => hcCrypto.symDecryptString(commonKey, encryptedDataKey))
        .then(JSON.parse)
        .then(dataKey => hcCrypto.symDecrypt(dataKey, encryptedData));

// createCryptoService :: String -> Object
const createCryptoService = (userId) => {
    const commonKeyPromise = userService.getUser(userId)
        .then(user => user.commonKey);

    // encryptData :: ArrayBufferView -> Promise([ArrayBufferView, String(base64)])
    const encryptArrayBufferView = createEncryptArrayBufferView(commonKeyPromise);
    // encryptString :: String -> Promise([String(base64), String(base64)])
    const encryptString = createEncryptString(commonKeyPromise);
    // encryptBlobs :: [ArrayBufferView] -> Promise([[ArrayBufferView], String(base64)])
    const encryptBlobs = createEncryptBlobs(commonKeyPromise);
    // encryptObject :: ArrayBufferView -> Promise([String(base64), String(base64)])
    const encryptObject = createEncryptObject(commonKeyPromise);


    // decryptData :: ArrayBuffer -> ArrayBuffer -> Promise(ArrayBuffer)
    const decryptData = createDecryptData(commonKeyPromise);

    return {
        encryptArrayBufferView,
        encryptString,
        encryptBlobs,
        encryptObject,
        decryptData,
    };
};

export default createCryptoService;
