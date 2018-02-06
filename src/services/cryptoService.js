import cryptoLib from '../lib/crypto';
import cryptoRoutes from '../routes/cryptoRoutes';

// decryptCommonKey :: JWK -> ArrayBuffer -> Promise(JWK)
const decryptCommonKey = privateKey => encryptedCommonKey =>
    cryptoLib.asymDecrypt(privateKey, encryptedCommonKey);

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

// TODO change name to something not use case driven or move to userService
// createGrantPermission :: Promise(JWK) -> String -> Promise(Object)
const createGrantPermission = commonKeyPromise => (userID) => {
    const userPublicKeyPromise = cryptoRoutes.getUserPublicKey(userID);

    return Promise.all([
        commonKeyPromise,
        userPublicKeyPromise,
    ]).then(([commonKey, publicKey]) =>
        cryptoLib.asymEncrypt(publicKey, commonKey),
    ).then(cryptoRoutes.postCommonKey(userID)); // too much?
};

// createCryptoService :: String -> JWK -> String -> Object
const createCryptoService = clientID => privateKey => (userID) => {
    const commonKeyPromise = cryptoRoutes
        .getDistributedKey(clientID, userID)
        .then(decryptCommonKey(privateKey));

    // encryptData :: ArrayBuffer -> Promise([ArrayBuffer, ArrayBuffer])
    const encryptData = createEncryptData(commonKeyPromise);
    // decryptData :: ArrayBuffer -> ArrayBuffer -> Promise(ArrayBuffer)
    const decryptData = createDecryptData(commonKeyPromise);
    // grantPermission :: ArrayBuffer -> Promise(Object)
    const grantPermission = createGrantPermission(commonKeyPromise);

    return {
        encryptData,
        decryptData,
        grantPermission,
    };
};

export default createCryptoService;
