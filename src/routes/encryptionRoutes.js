// String -> String -> Promise({ JWK, ArrayBuffer })
const getDistributedKey = (clientID, userID) =>
    Promise.resolve({
        jwk: { alg: 'ED25519' },
        distributedKey: 0xdeafbee,
    });

export default {
    getDistributedKey,
};
