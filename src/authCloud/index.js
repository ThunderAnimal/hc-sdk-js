import request from 'superagent';

const toBool = x => !!x;
const noop = () => {};
const isNotEmpty = x => x && x.length > 0;

/**
 * onceElse executed the first arg on the first call
 * and executes the second arg on all other calls.
 *
 * @param {function} f - function executed on first call
 * @param {function} h - function executed on every other call
 * @returns {*} what ever f and h are returning
 */
const onceElse = (f, h, notCalled = true) => () => {
    if (notCalled) {
        notCalled = false;
        return f();
    }

    return h();
};
const pickToken = ({ token }) => token;

export default {
    /**
     * Initiates GC.SDK with an access token
     *
     * @param {Object} param - config
     * @param {String} param.clientId - clientId as given by Gesundheitscloud
     * @param {String} param.clientURL - URL of the OAuth endpoint
     * @param {Object} [param.sdk=window.GC.SDK] - reference to GC.SDK
     * @param {Object} [param.globalWindow=window] - reference to the global window object
     *
     * @returns {Promise<String>} id - promise containting current user id
     */
    config({
        clientId,
        clientURL,
        sdk = window.GC.SDK,
        globalWindow = window,
    }) {
        const postKeys = ({ privateKey, publicKey }) =>
            request.post(`${clientURL}/gckeys`)
                .send({ private_key: privateKey, public_key: publicKey });

        /**
         * getSession checks /gctoken for private_key and token.
         *
         * @returns {Promise<{ privatKey, token }>} - Promise that contains
         *          the privateKey / token from the session
         */
        const getSession = () =>
            request.get(`${clientURL}/gctoken`).then(({ body, text }) => {
                const resObj = body || JSON.parse(text);
                resObj.privateKey = resObj.private_key;
                return resObj;
            }).catch((err) => {
                if (err.status === 404) {
                    return { token: null, err };
                }

                throw err;
            });

        const capPromise = sdk.createCAP();
        const setupHC = getSession().then(({ privateKey, token }) => {
            if (isNotEmpty(token)) {
                const getToken = onceElse(
                    () => Promise.resolve(token),
                    () => getSession().then(pickToken),
                );

                return sdk.setup(
                    clientId,
                    privateKey,
                    getToken,
                );
            }

            // returns an empty promise if the setup didn't work out
            return capPromise.then(postKeys).then(noop);
        });

        /**
         * Redirects to OAuth endpoint and triggers the OAuth Athorization Grant Flow
         * https://tools.ietf.org/html/rfc6749#section-4.1
         *
         * @return {undefined}
         */
        this.login = () => {
            capPromise.then(({ publicKey }) => {
                globalWindow.location.href = `${clientURL}/gclogin?public_key=${publicKey}`;
            });
        };

        /**
         * Contains true:  if there is a session already established
         * Contains false: if there is no session and sends a privateKey
         *                 to the OAuth Client
         * @type {Promise<Boolean>}
         */
        this.loggedIn = setupHC.then(toBool);

        // forwards setupHCs result
        return setupHC;
    },
};
