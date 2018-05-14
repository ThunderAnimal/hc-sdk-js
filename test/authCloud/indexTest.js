/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-nested-callbacks */
import 'babel-polyfill';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import request from 'superagent';

import auth from '../../src/authCloud';

const firstCall = 0;
const firstArg = 0;
const clientId = '123';
const clientURL = 'icarus.domain.com';
const createSDKMock = ({
    expId,
    expKey,
    expToken,
    capObj,
}) => ({
    setup(id, key, token) {
        expect(id).to.equal(expId);
        expect(key).to.equal(expKey);

        return token()
            .then(content => expect(content).to.equal(expToken))
            .then(() => 'magic id');
    },

    createCAP() {
        return Promise.resolve(capObj);
    },
});

const privateKey = 'secret';
const publicKey = 'look-at-me';
const token = 'i-am-an-access-token';
const tokenResponse = { private_key: privateKey, token };
const capObj = { privateKey, publicKey };
const noop = () => {};

describe('auth', () => {
    beforeEach(() => {
        request.get = noop;
        request.post = noop;
    });

    it('should be possible to initialize hc on successful token response', (done) => {
        const gcSDK = createSDKMock({
            expId: clientId,
            expKey: privateKey,
            expToken: token,
            capObj,
        });

        sinon.stub(request, 'get')
            .returns(Promise.resolve({ body: tokenResponse }));

        auth.config({ clientId, clientURL, sdk: gcSDK })
            .then((id) => {
                expect(id).to.be.a('string');
                return auth.loggedIn;
            })
            .then(loggedIn => expect(loggedIn).to.equal(true))
            .then(() => done())
            .catch(done);
    });

    it('should post keys on 404 token response', (done) => {
        const gcSDK = createSDKMock({
            expId: null,
            expKey: null,
            expToken: null,
            capObj,
        });

        const err = Error('No session');
        err.status = 404;

        sinon.stub(request, 'get')
            .returns(Promise.reject(err));
        sinon.stub(request, 'post')
            .returns({
                send() {
                    return Promise.resolve();
                },
            });

        auth.config({ clientId, clientURL, sdk: gcSDK })
            .then((id) => {
                expect(id).to.equal(undefined);
                return auth.loggedIn;
            })
            .then(loggedIn => expect(loggedIn).to.equal(false))
            .then(() => done())
            .catch(done);
    });

    it('should not post keys on 200 token response', (done) => {
        const text = JSON.stringify(tokenResponse);
        const gcSDK = createSDKMock({
            expId: clientId,
            expKey: privateKey,
            expToken: token,
            capObj,
        });

        sinon.stub(request, 'get')
            .returns(Promise.resolve({ text }));
        sinon.stub(request, 'post')
            .returns({
                send() {
                    done(Error('POST on /gckeys, even though /gctoken responded with 200'));
                },
            });

        auth.config({ clientId, clientURL, sdk: gcSDK })
            .then((id) => {
                expect(id).to.be.a('string');
                return auth.loggedIn;
            })
            .then(loggedIn => expect(loggedIn).to.equal(true))
            .then(() => done())
            .catch(done);
    });

    it('should redirect to client url login path on login call', (done) => {
        const windowMock = {
            location: {
                loc: 'schlarafenland',
                set href(name) {
                    this.loc = name;
                },
                get href() {
                    return this.loc;
                },
            },
        };
        const gcSDK = createSDKMock({
            expId: null,
            expKey: null,
            expToken: null,
            capObj,
        });

        sinon.stub(request, 'get')
            .returns(Promise.reject({ status: 404 }));
        sinon.stub(request, 'post')
            .returns({
                send() {
                    return Promise.resolve();
                },
            });

        auth.config({
            clientId,
            clientURL,
            sdk: gcSDK,
            globalWindow: windowMock,
        })
            .then((id) => {
                expect(id).to.equal(undefined);
                return auth.loggedIn;
            })
            .then(loggedIn => expect(loggedIn).to.equal(false))
            .then(auth.login)
            .then(() => expect(windowMock.location.href).to.equal(`${clientURL}/gclogin?public_key=${publicKey}`))
            .then(() => done())
            .catch(done);
    });
});
