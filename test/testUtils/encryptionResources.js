const clientID = '1123581321';
const userID = '12624120';
const granteeID = '31415926';
const privateKeyClientUser = { alg: 'RSA-OAEP-256', key: '0x6f98b5d235160fecc2e25ee936b72baa' };
const publicKeyGrantee = { alg: 'RSA-OAEP-256', key: '0x1a04c9d235160fecc2e25ee936b72bad', type: 'public' };
const encryptedCommonKey = 'encrypted_common_key';
const symKey = {
    alg: 'A256CBC', ext: true, k: 'quGuIIdEdy_S1Cd1Wy2eEsHSL_dfpkwcKssH9k6fPtY', key_ops: ['encrypt', 'decrypt'], kty: 'oct',
};
const commonKey = symKey;
const dataKey = symKey;
const encryptedDataKey = 'encrypted_data_key';
const attachmentKey = symKey;
const encryptedAttachmentKey = 'encrypted_attachment_key';
const tagEncryptionKey = symKey;
const encryptedTagEncryptionKey = 'encrypted_tag_encryption_key';
const data = new Uint8Array([1, 2, 3, 4, 5, 6]);
const encryptedData = 'encryptedData';
const string = 'string';
const encryptedString = 'encrypted_string';
const object = {};
const encryptedObject = 'encrypted_object';
const rawSymKey = '30iAFtkLLRFjuZKPvX6JOAwZaQbt+WlGusZfcNAWnXQ=';
const symHCKey = {
    t: 'dk',
    v: 1,
    sym: rawSymKey,
};

export default {
    clientID,
    userID,
    granteeID,
    privateKeyClientUser,
    publicKeyGrantee,
    encryptedCommonKey,
    commonKey,
    dataKey,
    encryptedDataKey,
    attachmentKey,
    encryptedAttachmentKey,
    tagEncryptionKey,
    encryptedTagEncryptionKey,
    data,
    encryptedData,
    string,
    encryptedString,
    object,
    encryptedObject,
    symHCKey,
    rawSymKey,
};
