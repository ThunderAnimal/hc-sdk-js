import cryptoLib from '../lib/crypto';
import cryptoRoutes from '../routes/encryptionRoutes';

// utils?

/*
const convertArrayBufferToJWK = (arrayBuffer) => {};

const getUserID = () => '112358132134'; //local storage
const getClientID = () => '12624120720'; // local storage
const getCupData = () => ({ // local storage
    jwk: { alg: 'AES256-GCM' },
    encryptedCup: 0xbadbee,
});
*/

// decryptDistributedKey :: JWK -> Binary -> Promise(JWK)
const decryptDistributedKey = privateKey => distributedKey =>
    cryptoLib.asymDecrypt(privateKey, distributedKey);

// createEncryptData :: Promise(JWK) -> Binary -> Promise([ Binary, Binary ])
const createEncryptData = commonKeyPromise => (document) => {
    const dataKeyPromise = cryptoLib.generateSymKey();

    return Promise.all([commonKeyPromise, dataKeyPromise])
        .then(([commonKey, dataKey]) => {
            const encryptedDataKeyPromise = cryptoLib.symEncrypt(commonKey);
            const encryptedDocumentPromise = cryptoLib.symEncrypt(document, dataKey);

            return Promise.all([
                encryptedDocumentPromise,
                encryptedDataKeyPromise,
            ]);
        });
};

// createDecryptData :: Promise(JWK) -> Binary -> Binary -> Promise(Binary)
const createDecryptData = commonKeyPromise => (encryptedDocument, encryptedDataKey) =>
    commonKeyPromise.then(commonKey => cryptoLib.symDecrypt(encryptedDataKey, commonKey))
        .then(dataKey => cryptoLib.symDecrypt(encryptedDocument, dataKey));

// cryptoService :: String -> JWK -> String -> Object
const cryptoService = clientID => ({ privateKey }) => (userID) => {
    const commonKeyPromise = cryptoRoutes
        .getDistributedKey(userID, clientID)
        .then(decryptDistributedKey(privateKey));

    // encryptData :: Binary -> Promise([Binary, Binary])
    const encryptData = createEncryptData(commonKeyPromise);
    // decryptData :: Binary -> Binary -> Promise(Binary)
    const decryptData = createDecryptData(commonKeyPromise);

    return {
        encryptData,
        decryptData,
    };
};

export default cryptoService;
