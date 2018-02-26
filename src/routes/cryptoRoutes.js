// TODO remove eslint ignore
/* eslint-disable no-unused-vars */
import userService from '../services/userService';
import crypto from '../lib/crypto';

// String -> String -> Promise(String)
const getCommonKey = (clientID, userID) =>
    crypto.asymEncryptString(
        userService.user.CUP.publicKey,
        JSON.stringify(userService.user.commonKey));

const getUserPublicKey = userID =>
    Promise.resolve({
        alg: 'RSA',
        key: 0xfeebeee,
    });

const postCommonKey = targetUserID => commonKey =>
    Promise.resolve({
        status: 200,
    });

export default {
    getCommonKey,
    getUserPublicKey,
    postCommonKey,
};
