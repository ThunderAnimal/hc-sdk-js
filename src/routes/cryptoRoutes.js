// String -> String -> Promise({ JWK, ArrayBuffer })
const getDistributedKey = (clientID, userID) =>
    Promise.resolve({
        jwk: { alg: 'ED25519' },
        distributedKey: 0xdeafbee,
    });

const getUserPublicKey = (userID) =>
    Promise.resolve({
        alg: 'RSA',
        key: 0xfeebeee,
    });

const postCommonKey = targetUserID => commonKey =>
    Promise.resolve({
        status: 200,
    });

export default {
    getDistributedKey,
    getUserPublicKey,
    postCommonKey,
};
