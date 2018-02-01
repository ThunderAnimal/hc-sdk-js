import cryptoLib from '../lib/crypto';
import cryptoRoutes from '../routes/encryptionRoutes';

// decryptDistributedKey :: JWK -> ArrayBuffer -> Promise(JWK)
const decryptDistributedKey = privateKey => distributedKey =>
    cryptoLib.asymDecrypt(privateKey, distributedKey);

// createEncryptData :: Promise(JWK) -> ArrayBuffer -> Promise([ ArrayBuffer, ArrayBuffer ])
const createEncryptData = commonKeyPromise => (data) => {
    const dataKeyPromise = cryptoLib.generateSymKey();

    return Promise.all([commonKeyPromise, dataKeyPromise])
        .then(([commonKey, dataKey]) => {
            const encryptedDataKeyPromise = cryptoLib.symEncrypt(commonKey, dataKey);
            const encryptedDataPromise = cryptoLib.symEncrypt(dataKey, data);

            return Promise.all([
                encryptedDataPromise,
                encryptedDataKeyPromise,
            ]);
        });
};

// createDecryptData :: Promise(JWK) -> ArrayBuffer -> ArrayBuffer -> Promise(ArrayBuffer)
const createDecryptData = commonKeyPromise => (encryptedData, encryptedDataKey) =>
    commonKeyPromise
        .then(commonKey => cryptoLib.symDecrypt(commonKey, encryptedDataKey))
        .then(dataKey => cryptoLib.symDecrypt(dataKey, encryptedData));

// createCryptoService :: String -> JWK -> String -> Object
const createCryptoService = clientID => privateKey => (userID) => {
    const commonKeyPromise = cryptoRoutes
        .getDistributedKey(clientID, userID)
        .then(decryptDistributedKey(privateKey));

    // encryptData :: ArrayBuffer -> Promise([ArrayBuffer, ArrayBuffer])
    const encryptData = createEncryptData(commonKeyPromise);
    // decryptData :: ArrayBuffer -> ArrayBuffer -> Promise(ArrayBuffer)
    const decryptData = createDecryptData(commonKeyPromise);

    return {
        encryptData,
        decryptData,
    };
};

export default createCryptoService;
