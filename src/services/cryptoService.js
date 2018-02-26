import cryptoLib from '../lib/crypto';
import cryptoRoutes from '../routes/cryptoRoutes';

// decryptCommonKey :: JWK -> ArrayBuffer -> Promise(JWK)
const decryptCommonKey = privateKey => encryptedCommonKey =>
    cryptoLib.asymDecryptString(privateKey, encryptedCommonKey)
        .then(JSON.parse);

// createEncryptData :: encrypt<Data> => Promise(JWK) -> Data ->
//      Promise([ String/ArrayBufferView, String ])
const createEncryptData = encryptionMethod => commonKeyPromise =>
    (data, givenEncryptedDataKeyPromise) => {
        const dataKeyPromise = Promise.all([commonKeyPromise, givenEncryptedDataKeyPromise])
            .then(([commonKey, encryptedDataKey]) => {
                if (encryptedDataKey) {
                    return cryptoLib.symDecryptObject(commonKey, encryptedDataKey);
                }
                return cryptoLib.generateSymKey();
            });
        return Promise.all([commonKeyPromise, dataKeyPromise])
            .then(([commonKey, dataKey]) => {
                const encryptedDataKeyPromise = cryptoLib.symEncryptObject(commonKey, dataKey);
                const encryptedDataPromise = encryptionMethod(dataKey, data);

                return Promise.all([
                    encryptedDataPromise,
                    encryptedDataKeyPromise,
                ]);
            });
    };

const createEncryptArrayBufferView = createEncryptData(cryptoLib.symEncrypt);

const createEncryptBlobs = createEncryptData((dataKey, blobArray) =>
    Promise.all(blobArray.map(blob => cryptoLib.symEncryptBlob(dataKey, blob))));

const createEncryptString = createEncryptData(cryptoLib.symEncryptString);

const createEncryptObject = createEncryptData(cryptoLib.symEncryptObject);

// createDecryptData :: Promise(JWK) -> String, ArrayBuffer -> Promise(ArrayBuffer)
const createDecryptData = commonKeyPromise => (encryptedDataKey, encryptedData) =>
    commonKeyPromise
        .then(commonKey => cryptoLib.symDecryptString(commonKey, encryptedDataKey))
        .then(JSON.parse)
        .then(dataKey => cryptoLib.symDecrypt(dataKey, encryptedData));

// createCryptoService :: String -> JWK -> String -> Object
const createCryptoService = clientID => privateKey => (userID) => {
    const commonKeyPromise = cryptoRoutes
        .getCommonKey(clientID, userID)
        .then(decryptCommonKey(privateKey));

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
