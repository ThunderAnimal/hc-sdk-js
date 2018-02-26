const clientID = '1123581321';
const userID = '12624120';
const granteeID = '31415926';
const privateClientUserJWK = { alg: 'RSA-OAEP-256', key: '0x6f98b5d235160fecc2e25ee936b72baa' };
const publicGranteeJWK = { alg: 'RSA-OAEP-256', key: '0x1a04c9d235160fecc2e25ee936b72bad', type: 'public' };
const encryptedCommonKeyJWK = 'encrypted_common_key';
const symKey = {
    alg: 'A256CBC', ext: true, k: 'quGuIIdEdy_S1Cd1Wy2eEsHSL_dfpkwcKssH9k6fPtY', key_ops: ['encrypt', 'decrypt'], kty: 'oct',
};
const commonKey = symKey;
const dataKey = symKey;
const encryptedDataKey = 'encrypted_data_key';
const fileKey = symKey;
const encryptedFileKey = 'encrypted_file_key';
const data = new Uint8Array([1, 2, 3, 4, 5, 6]);
const encryptedData = 'encryptedData';
const string = 'string';
const encryptedString = 'encrypted_string';
const object = {};
const encryptedObject = 'encrypted_object';

export default {
    clientID,
    userID,
    granteeID,
    privateClientUserJWK,
    publicGranteeJWK,
    encryptedCommonKeyJWK,
    commonKey,
    dataKey,
    encryptedDataKey,
    fileKey,
    encryptedFileKey,
    data,
    encryptedData,
    string,
    encryptedString,
    object,
    encryptedObject,
};
